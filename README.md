# 飞布/Fireboom SDK 下载/同步工具

每次手动下载飞布 SDK 太麻烦？从服务端同步 SDK 不方便？试试这个工具吧！

## 安装

```shell
npm i -g fb-sdk-downloader
# 如果只想要在当前项目使用
npm i -D fb-sdk-downloader
```

## 使用

```shell
fb-sdk-downloader --url http://localhost:9123 --output ./src/api --sdk ts-client --token <FIREBOOM_CONSOLE_KEY> --ignore index.ts
```

你也可以把这个命令写到 package.json 的 scripts 字段中，例如：

```json
{
  "scripts": {
    "sync-sdk": "fb-sdk-downloader --url http://localhost:9123 --output ./src/api --sdk ts-client --token <FIREBOOM_CONSOLE_KEY> --ignore index.ts"
  }
}
```

## 参数说明

- `--url` 飞布9123端口对应的控制台地址，例如 `http://localhost:9123`
- `--output` 下载后的 SDK 保存路径，例如 `./src/api`
- `--sdk` 要下载的客户端 SDK 名称，需要现在飞布控制台下载并启用
- `--token` 飞布控制台的登录密钥，可以在飞布根目录下的`authentication.key`文件中获取
- `--ignore` 要忽略的文件，例如 `index.ts`，多个文件英文逗号`,`间隔

## 发布

```shell
npm publish --access public
```