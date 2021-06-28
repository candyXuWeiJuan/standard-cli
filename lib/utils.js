const { pkgPath } = require('./path')
const fs = require('fs-extra')
const spawn = require('cross-spawn')
const { resolve } = require('path')
const chalk = require('chalk')
const ora = require('ora')

const commdSuccess = res => {
	if (Array.isArray(res)) {
		return res.every(r => r.status === 0 && r.error === null)
	}
	return res.status === 0 && res.error === null
}
const log = console.log
const logError = mesg => {
	log(chalk.red(`${mesg}\n`))
}
const logBgError = mesg => {
	log(chalk.bgRed(`${mesg}\n`))
}
const logSuccess = mesg => {
	log(chalk.green(`${mesg}\n`))
}
const logBgSuccess = mesg => {
	log(chalk.bgGreen(`${mesg}\n`))
}
const logWarn = mesg => {
	log(chalk.yellow(`${mesg}\n`))
}
const logBgWarn = mesg => {
	log(chalk.bgYellow(`${mesg}\n`))
}
const logInfo = mesg => {
	log(chalk.blue(`${mesg}\n`))
}
const logBgInfo = mesg => {
	log(chalk.bgBlue(`${mesg}\n`))
}
const rootDir = process.cwd()
const rootResolve = relpath => {
	return resolve(rootDir, relpath)
}
const selfRootDir = resolve(__dirname, '../')
const selfRootResolve = p => {
	return resolve(selfRootDir, p)
}
const selfPkgPath = resolve(__dirname, '../package.json')
const selfPkgJson = {
	getJson() {
		try {
			return require(selfPkgPath)
		} catch (error) {
			return {}
		}
	},
	writeFile(path, keyValues) {
		return new Promise((resolve, reject) => {
			const json = selfPkgJson.getJson()
			Object.keys(keyValues).forEach(key => {
				json[key] = keyValues[key]
			})
			fs.writeFile(path, JSON.stringify(json, null, '\t'), err => {
				if (err) {
					logError(err)
					reject(false)
				}
				resolve(true)
			})
		})
	},
}

const fsExitsProm = path => {
	return new Promise(resolve => {
		fs.access(path, fs.constants.F_OK, err => {
			if (err) {
				return resolve(false)
			}
			return resolve(true)
		})
	})
}
const addVsCodeExtensions = (exts = []) => {
	const codeExtlist = spawn.sync('code', ['--list-extensions'])
	if (!commdSuccess(codeExtlist)) {
		logError(
			`自动安装vscode拓展失败，请手动安装以下依赖 ${exts.join(' 和 ')}`,
		)
		return
	}
	const nameList = (codeExtlist.stdout && codeExtlist.stdout.toString()) || ''
	if (Array.isArray(exts)) {
		exts.forEach(etxname => {
			if (!nameList.includes(etxname)) {
				const codeInstallP = spawn.sync('code', [
					'--install-extension',
					etxname,
				])
				if (commdSuccess(codeInstallP)) {
					logSuccess(`vscode 依赖 ${etxname} 安装成功`)
				} else {
					logError(
						`自动安装vscode拓展失败，请手动安装以下依赖 ${etxname}`,
					)
				}
			}
		})
	}
}
const spinnerStart = mesg => {
	return ora(mesg).start()
}
const installDepandance = deps => {
	const specialInstall = ['@vue/eslint-config-typescript']
	const specialExits = deps.filter(dep => specialInstall.includes(dep))
	if (specialExits.length) {
		const processCmd = spawn.sync(
			'npx',
			['install-peerdeps', '--dev', ...specailDeps],
			{
				stdio: 'inherit',
			},
		)
	}
	const normalDep = deps.filter(dep => !specialInstall.includes(dep))
	if (normalDep.length) {
		const processCmd = spawn.sync('npm', ['install', '-D', ...normalDep], {
			stdio: 'inherit',
		})
	}
}
const pkgJson = () => {
	try {
		return require(pkgPath)
	} catch (error) {
		console.log(error)
		return error
	}
}
exports.installDepandance = installDepandance
exports.rootDir = rootDir
exports.rootResolve = rootResolve
exports.selfRootDir = selfRootDir
exports.selfRootResolve = selfRootResolve
exports.fsExitsProm = fsExitsProm
exports.selfPkgJson = selfPkgJson
exports.selfPkgPath = selfPkgPath
exports.log = log
exports.logError = logError
exports.logBgError = logBgError
exports.logSuccess = logSuccess
exports.logBgSuccess = logBgSuccess
exports.logWarn = logWarn
exports.logBgWarn = logBgWarn
exports.logInfo = logInfo
exports.logBgInfo = logBgInfo
exports.commdSuccess = commdSuccess
exports.addVsCodeExtensions = addVsCodeExtensions
exports.spinnerStart = spinnerStart
exports.pkgJson = pkgJson
