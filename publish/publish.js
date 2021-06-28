// 发布脚本 更新版本号 -> git 提交 -> 发布到npm
const spawn = require('cross-spawn')
const {
	selfPkgJson,
	selfPkgPath,
	logError,
	commdSuccess,
} = require('../lib/utils')
const argvs = process.argv.slice(2)
const versionUpdate = argvs[0]
let newVersion = ''
const updateVersion = async () => {
	const version = selfPkgJson.getJson().version
	console.log('version', version)
	const [major, minor, patch] = version.split('.')
	let versionMap = { major, minor, patch }
	if (versionUpdate) {
		versionMap[versionUpdate] = ++versionMap[versionUpdate]
		if (versionUpdate === 'major') {
			versionMap.minor = 0
			versionMap.patch = 0
		}
		if (versionUpdate === 'minor') {
			versionMap.patch = 0
		}
	}
	newVersion = Object.values(versionMap).join('.')
	try {
		await selfPkgJson.writeFile(selfPkgPath, {
			version: newVersion,
		})
	} catch (error) {
		logError('版本更新失败, 请检查后手动发布')
		process.exit(1)
	}
}
const gitSubmit = () => {
	return new Promise(resolve => {
		const gitAddRes = spawn.sync('git', ['add', '.'], {
			stdio: 'inherit',
		})
		const gitCommitRes = spawn.sync(
			'git',
			['commit', '-m', `publish: 升级版本到${newVersion}`],
			{
				stdio: 'inherit',
			},
		)
		const gitPushRes = spawn.sync('git', ['push'], {
			stdio: 'inherit',
		})
		const gitTagRes = spawn.sync('git', ['tag', newVersion], {
			stdio: 'inherit',
		})
		const gitTagPushRes = spawn.sync(
			'git',
			['push', 'origin', newVersion],
			{
				stdio: 'inherit',
			},
		)
		if (
			!commdSuccess([
				gitAddRes,
				gitCommitRes,
				gitPushRes,
				gitTagRes,
				gitTagPushRes,
			])
		) {
			logError('git 提交失败, 发布失败，请检查后手动发布')
			process.exit(1)
		}
		resolve()
	})
}
const npmPublish = () => {
	return new Promise(resolve => {
		const whoamiNpm = spawn.sync('npm', ['whoami'], {
			stdio: 'inherit',
		})
		if (!commdSuccess(whoamiNpm)) {
			const isLoginRes = spawn.sync('npm', ['login'], {
				stdio: 'inherit',
			})
			if (!commdSuccess(isLoginRes)) {
				logError('npm 登录失败，请登录后手动发布 npm publish')
				process.exit(1)
			}
		}
		const result = spawn.sync('npm', ['publish', '--access', 'public'], {
			stdio: 'inherit',
		})
		if (!commdSuccess(result)) {
			logError(result.error)
			logError('发布失败，请检查后手动发布 npm publish')
			process.exit(1)
		}
		resolve()
	})
}
const publish = async () => {
	// 更新版本号
	await updateVersion()
	// 提交git版本
	await gitSubmit()
	// 发布
	await npmPublish()
}

publish()
