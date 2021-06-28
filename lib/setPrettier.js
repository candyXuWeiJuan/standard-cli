const fse = require('fs-extra')
const {
	rootResolve,
	selfRootResolve,
	spinnerStart,
	logInfo,
	addVsCodeExtensions,
	installDepandance,
} = require('./utils')
module.exports = async function (projectType, langType) {
	const eslintSpinner = spinnerStart(
		'[prettier]: 正在重写prettier规则，请稍等...\n',
	)
	//先删prettier配置文件
	await fse.remove(rootResolve('prettierrc'))
	await fse.remove(rootResolve('prettierrc.js'))
	await fse.remove(rootResolve('prettierrc.json'))
	//后写入配置的prettier文件
	const stdPrettierrcPath =
		projectType === 'node'
			? './lib/config-detail/.prettierrc-node'
			: './lib/config-detail/.prettierrc'
	await fse.copyFile(
		selfRootResolve(stdPrettierrcPath),
		rootResolve('./.prettierrc'),
	)
	//install依赖
	logInfo('[prettier]: 开始安装prettier相关依赖')
	const depandance = require(selfRootResolve(
		`./lib/config-dependences/index.js`,
	))
	const prettierDeps =
		projectType === 'node'
			? depandance.prettier.node
			: depandance.prettier.vue
	try {
		await installDepandance(prettierDeps)
		eslintSpinner.succeed('[prettier]: 依赖安装成功！')
	} catch (error) {
		eslintSpinner.succeed('[prettier]: 依赖安装失败！')
		process.exit(1)
	}
	//editor文件写入
	await fse.copySync(
		selfRootResolve('./lib/config-detail/.editorconfig'),
		rootResolve('./.editorconfig'),
	)
	//vscode插件安装
	addVsCodeExtensions([
		'EditorConfig.EditorConfig',
		'esbenp.prettier-vscode',
		'quanzaiyu.vscode-vue-pug-enhanced',
		'octref.vetur',
	])
}
