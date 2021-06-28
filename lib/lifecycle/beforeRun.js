const download = require('download')
const { copy, remove, readFile } = require('fs-extra')
const selectProject = require('../select-project')
const { logInfo, logError, selfRootResolve } = require('../utils')
const { resourcePath, configCopyPath } = require('../path')
const copyConfig = async () => {
	for (let copySet of configCopyPath) {
		await copy(selfRootResolve(copySet.from), selfRootResolve(copySet.to))
	}
}
const getConfigFileFromGit = async () => {
	logInfo('正在从远端拉取配置文件，请稍后...')
	try {
		//拉取配置资源池
		await download(resourcePath, selfRootResolve('./.configs'), {
			extract: true,
		})
		await copyConfig()
		remove(selfRootResolve('./.configs'))
	} catch (error) {
		logError('从远端获取配置失败！')
		logError(error)
		process.exit(1)
	}
}

module.exports = async function beforeRun() {
	try {
		//应用的项目类型 目前支持 vue2-js vue3-js vue2-ts vue3-ts node-js node-ts
		const { projectType, langType } = await selectProject()
		// 远端拉取配置文件
		await getConfigFileFromGit()
		return {
			projectType,
			langType,
		}
	} catch (error) {
		logError(error)
		process.exit(1)
	}
}
