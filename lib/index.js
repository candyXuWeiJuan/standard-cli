const setIgnore = require('./setIgnore')
const setPrettier = require('./setPrettier')
const setEslint = require('./setEslint')
const setHusky = require('./setHusky')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const chalk = require('chalk')
const spawn = require('cross-spawn')
const {
	fsExitsProm,
	rootResolve,
	logError,
	logInfo,
	logSuccess,
	pkgJson,
} = require('./utils')
const { beforeRun } = require('./lifecycle')
const choice = new Map([
	['init', [setHusky, setEslint, setPrettier, setIgnore]],
	['eslint', [setIgnore, setPrettier, setEslint]],
	['prettier', [setIgnore, setPrettier, setEslint]],
	['husky', [setHusky]],
	['ignore', [setIgnore]],
])
let cmdName = ''
class standard {
	constructor(option) {
		this.optionMatch(option)
	}
	optionMatch(option) {
		const optionKey = [...choice.keys()]
		const [cmd] = optionKey.filter(val => option[val])
		if (cmd) {
			cmdName = cmd
			const excuteArr = choice.get(cmd)
			if (this.notInit(cmd)) this.excuteOption(excuteArr)
		}
	}
	//非init命令那就是更新,要判断项目原来是否执行执行过init
	notInit(cmd) {
		let excute = true
		if (cmd != 'init') {
			const needInit = pkgJson()._standardInited
			if (!needInit) logError('非标准化项目,请先执行init命令操作')
			excute = false
		}
		return excute
	}
	async excuteOption(excuteArr) {
		//拉取资源
		const { projectType, langType } = await beforeRun()
		//执行规范命令的实际内容
		excuteArr.reduce(async (final, eachRun) => {
			await final
			await eachRun(projectType, langType)
		}, Promise)
	}
}
process.on('beforeExit', async code => {
	if (
		code === 0 &&
		(cmdName === 'prettier' || cmdName === 'eslint' || cmdName === 'init')
	) {
		try {
			// 删除.vscode文件
			await deleteVscodeSetting()
			/**
				prettier Bug: waiting for fixed
				https://github.com/prettier/plugin-pug/issues/174#event-4156483876
			*/
			// fixPrettierBugByReWriteFile(prettierFix)
			prettierFix()
			eslintFix()
			console.log(
				chalk.bgMagenta('规则配置成功'),
				chalk.bgMagenta(
					'设置里打开 formatOnSave 后，关闭当前窗口，重启vscode, 开始体验吧~',
				),
			)
			process.exit(0)
		} catch (error) {
			logError(error)
			process.exit(1)
		}
	}
})
// 删除.vscode文件
const deleteVscodeSetting = async () => {
	try {
		const vscodeSettingPath = rootResolve('./.vscode')
		console.log(await fsExitsProm(vscodeSettingPath))
		const isVscodeSettingExist = await fsExitsProm(vscodeSettingPath)
		if (isVscodeSettingExist) {
			logInfo(
				'即将删除根目录下的.vscode文件夹，因为此配置可能会和规则有冲突...\n',
			)
			const answer = await inquirer.prompt([
				{
					type: 'list',
					message: '是否需要为您备份.vscode文件？',
					name: 'vscodeCopy',
					choices: ['是', '否'],
				},
			])
			const { vscodeCopy } = answer || {}
			if (vscodeCopy === '是') {
				fse.copySync(vscodeSettingPath, rootResolve('./.vscode-copy'))
				logSuccess('备份完成, 可在根目录下.vscode-copy文件夹查看')
			}
			fse.removeSync(vscodeSettingPath)
			logSuccess('.vscode文件夹删除成功')
		}
	} catch (error) {
		logError(
			'.vscode文件夹检测失败了, 如果您的根目录包含.vscode文件夹，请删除后再试',
		)
	}
}
//eslint格式化
const eslintFix = () => {
	logInfo('[eslint]: 正在修复文件格式，请稍后...')
	try {
		spawn.sync('npx', ['eslint', '--fix', '.'], {
			stdio: 'inherit',
		})
	} catch (error) {
		logError(
			'[eslint]: 文件格式修复失败，您可以手动修复 npx eslint --fix .',
		)
	}
}
//prettier格式化
const prettierFix = () => {
	logInfo('[prettier]: 正在修复文件格式，请稍后...')
	try {
		spawn.sync(
			'npx',
			['prettier', '--write', '**/*.{js,ts,jsx,vue,tsx,html}'],
			{
				stdio: 'inherit',
			},
		)
	} catch (error) {
		logError(
			'[prettier]: 文件格式修复失败，您可以手动修复 npx eslint --fix .',
		)
	}
}
module.exports = standard
