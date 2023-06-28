#!/usr/bin/env node

import process from 'node:process'
import cpy, { type ProgressEmitter } from 'cpy'
import { lilconfig } from 'lilconfig'
import { homepage, name } from '../package.json'

function fatal(message: string) {
  console.error(`[${name}]`, message, `\n\nDocs: ${homepage}\n`)
  process.exit(1)
}

function info(message: string) {
  console.info(`[${name}]`, message)
}

function formatBytes(bytes: number): string {
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Number((bytes / 1024 ** i).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i]}`
}

void (async () => {
  console.info()
  const file = await lilconfig(name, {}).search()

  if (!file || file.isEmpty || !(typeof file.config === 'object' && !Array.isArray(file.config) && file.config !== null))
    return fatal('No valid config found.')

  const config = file.config as { tasks: unknown }

  if (!Array.isArray(config.tasks))
    return fatal('The `tasks` property in config needs to be an array.')

  const tasks: Array<ReturnType<ProgressEmitter['on']>> = []

  let totalFiles = 0
  let totalSize = 0

  config.tasks.forEach((task) => {
    if (!Array.isArray(task))
      return fatal(`Item in \`tasks\` needs to be an array. Found:\n${JSON.stringify(task)}`)

    const source: unknown = task.at(0)
    const destination: unknown = task.at(1)
    const options: unknown = task.at(2)

    if (!(Array.isArray(source) && source.every(i => typeof i === 'string') && !!source.length) && typeof source !== 'string')
      return fatal(`First item in \`tasks\` item is \`source\` and needs to be a string or an array of strings. Found:\n${JSON.stringify(task)}`)

    if (typeof destination !== 'string')
      return fatal(`Second item in \`tasks\` item is \`destination\` and needs to be a string. Found:\n${JSON.stringify(task)}`)

    if (
      !(typeof options === 'object' && !Array.isArray(options) && options !== null)
      && options !== undefined
    )
      return fatal(`Optional third item in \`tasks\` item is \`options\` and needs to be a \`cpy\` options object. Found:\n${JSON.stringify(task)}`)

    tasks.push(
      cpy(source, destination, options).on('progress', (progress) => {
        if (progress.percent !== 1)
          return

        totalFiles = totalFiles + progress.completedFiles
        totalSize = totalSize + progress.completedSize
      }),
    )
  })

  try {
    await Promise.all(tasks)
  }
  catch (error) {
    if (error instanceof Error && error.name === 'CpyError')
      fatal(error.message)
    else
      throw error
  }

  info(`Created ${totalFiles} files (${formatBytes(totalSize)}).`)
  console.info()
})()
