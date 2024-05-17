#!/usr/bin/env node

/**
 * @example
 * scripts: {
 *   "sync:sdk": "fb-sdk-downloader --url http://localhost:9123 --output ./src/api --sdk ts-client --token <FIREBOOM_CONSOLE_KEY> --ignore index.ts,a.ts
 * }
 */

const { writeFile, mkdir, stat, unlink } = require('node:fs/promises')
const { join } = require('node:path')
const { tmpdir } = require('node:os')
const AdmZip = require('adm-zip')

// 读取命令行参数
const args = process.argv.slice(2)

function getArgValue(arg) {
  const index = args.indexOf(arg)
  if (index === -1) {
    return null
  }
  return args[index + 1]
}
const url = getArgValue('--url')
let output = getArgValue('--output')
const sdk = getArgValue('--sdk')
const token = getArgValue('--token')
const ignorePaths = getArgValue('--ignore')
const ignorePathArr = ignorePaths ? ignorePaths.split(',') : []

if (!url) {
  return console.error('Please provide a valid Fireboom URL, eg: --url http://localhost:9123')
}

if (!sdk) {
  return console.error('Please provide a valid SDK type, eg: --sdk ts-client')
}

if (!output) {
  output = `./generated-sdk/${sdk}`
}

// 确保输出目录已经存在
async function ensureDir() {
  try {
    await mkdir(output, { recursive: true })
  } catch (error) {
    console.error(`Error when create output dir ${output}`)
    console.error(error)
  }
}

// 下载文件并解压到当前目录
async function run() {
  const downloadUrl = `${url}/api/sdk/downloadOutput/${sdk}${token ? `?auth-key=${token}` : ''}`
  try {
    // 下载到临时文件
    const tmpZipFilePath = join(tmpdir(), `fb-sdk-${new Date().getTime()}.zip`)
    const response = await fetch(downloadUrl)
    const buffer = await response.arrayBuffer()
    await writeFile(tmpZipFilePath, Buffer.from(buffer))
    // 读取压缩包
    const zip = new AdmZip(tmpZipFilePath)
    const entries = zip.getEntries()
    await ensureDir()
    for (const entry of entries) {
      if (ignorePathArr.includes(entry.name)) {
        // 先判断文件是否存在
        try {
          const s = await stat(join(output, entry.name))
          if (s.isFile() || s.isDirectory()) {
            continue
          }
        } catch (error) {
          // 文件不存在，可以写入
        }
      }
      const data = entry.getData().toString('utf8')
      const filePath = join(output, entry.name)
      if (entry.isDirectory) {
        await mkdir(filePath, { recursive: true })
      } else {
        console.log(`download file: ${entry.name}`)
        try {
          await writeFile(filePath, data)
        } catch (error) {
          console.error(`Error when write file ${filePath}`)
          console.error(error)
        }
      }
    }
    tmpZipFilePath && await unlink(tmpZipFilePath)
    console.log(`${sdk} SDK downloaded to ${output}`)
  } catch (error) {
    console.error(`Fail to download sdk file, url ${downloadUrl}`)
    console.error(error)
  }
}

run()
