const fse = require('fs-extra')
const {
	rootResolve,
	selfRootResolve,
	spinnerStart,
	logInfo,
	logError,
	logSuccess,
	installDepandance,
} = require('./utils')
module.exports = async function (projectType, langType) {
	const eslintSpinner = spinnerStart(
		'[eslint]: 正在重写eslint规则，请稍等...\n',
	)
	//先删
	await fse.remove(rootResolve('eslintrc'))
	await fse.remove(rootResolve('eslintrc.js'))
	await fse.remove(rootResolve('eslintrc.json'))
	//后写
	await fse.copyFile(
		selfRootResolve(
			`./lib/config-detail/eslintrc-${projectType + langType}.js`,
		),
		rootResolve('eslintrc.js'),
	)
	//install依赖
	logInfo('[eslint]: 开始安装eslint相关依赖')
	const depandance = require(selfRootResolve(
		`./lib/config-dependences/index.js`,
	))
	const eslintDepandance = depandance.eslint[`${projectType} + ${langType}`]
	try {
		await installDepandance(eslintDepandance)
	} catch (error) {
		logError('[eslint]: 依赖安装失败！')
		process.exit(1)
	}
	eslintSpinner.succeed('[eslint]: 依赖安装成功！')
}
