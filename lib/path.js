const path = require('path')
const localPath = process.cwd()
const formPath = './.configs/standard-master/standard/'
const toPath = './lib/'
exports.pkgPath = path.resolve(localPath, 'package.json')
exports.resourcePath =
	'https://github.com/candyXuWeiJuan/standard/archive/refs/heads/master.zip'
exports.configCopyPath = [
	{ from: `${formPath}config-detail`, to: `${toPath}config-detail` },
	{ from: `${formPath}config-ignore`, to: `${toPath}config-ignore` },
	{
		from: `${formPath}config-dependences`,
		to: `${toPath}config-dependences`,
	},
]
