const fse = require('fs-extra')
const spawn = require('cross-spawn')
const {
	logSuccess,
	logError,
	logInfo,
	installDepandance,
	pkgJson,
	rootResolve,
	selfRootResolve,
} = require('./utils')
module.exports = async function () {
	//拷贝commitlint
	await fse.copyFile(
		selfRootResolve(`./lib/config-detail/commitlint.config.js`),
		rootResolve('commitlint.config'),
	)
	//写入package
	const package = pkgJson()
	package._standardInited = true
	package.husky = {
		hooks: {
			'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
			'pre-commit': 'lint-staged',
		},
	}
	package['lint-staged'] = {
		'*.{js,jsx,ts,tsx,html,css,vue,less,scss}':
			'prettier  --plugin-search-dir ./node_modules --write',
	}
	try {
		logInfo('[git-husky]: 正在将husky写入package.json，请稍等···')
		await fse.writeFile(
			rootResolve('package.json'),
			JSON.stringify(package, null, '\t'),
		)
		logSuccess('[husky]:package文件写入成功')
	} catch (error) {
		logError('[husky]:package文件写入失败')
		process.exit(1)
	}
	//install依赖
	const depandance = require(selfRootResolve(
		`./lib/config-dependences/index.js`,
	))
	const huskyDepandance = depandance.husky
	try {
		await installDepandance(huskyDepandance)
		logSuccess('[husky]: 依赖安装成功！')
	} catch (error) {
		logError('[husky]: 依赖安装失败！')
		process.exit(1)
	}
	//.gitignore文件写入
	await fse.remove(rootResolve('.gitignore'))
	await fse.copyFile(
		selfRootResolve(`./lib/config-detail/.gitignore`),
		rootResolve('gitignore.js'),
	)
}
