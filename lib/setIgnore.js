const fs = require('fs-extra')
const {
	logSuccess,
	rootResolve,
	selfRootResolve,
	logError,
} = require('./utils')
module.exports = async () => {
	// 复制eslintignore
	try {
		fs.copySync(
			selfRootResolve('./lib/config-ignore/.eslintignore'),
			rootResolve('./.eslintignore'),
		)
		logSuccess('[ignore]: .eslintignore 文件写入成功')
	} catch (error) {
		logError(
			'[ignore]: .eslintignore 文件写入失败了，请重试 es-standard -g',
		)
		process.exit(1)
	}

	// 复制prettierignore
	try {
		fs.copySync(
			selfRootResolve('./lib/config-ignore/.prettierignore'),
			rootResolve('./.prettierignore'),
		)
		logSuccess('[ignore]: .prettierignore 文件写入成功')
	} catch (error) {
		logError(
			'[ignore]: .prettierignore 文件写入失败了，请重试 es-standard -g',
		)
		process.exit(1)
	}
}
