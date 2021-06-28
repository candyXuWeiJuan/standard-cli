const inquirer = require('inquirer')
module.exports = async () => {
	try {
		const answer = await inquirer.prompt([
			{
				type: 'list',
				message: '您的项目是以下哪一种类型?',
				name: 'project',
				choices: [
					'vue2 + js',
					'vue2 + ts',
					'vue3 + js',
					'vue3 + ts',
					'node + js',
					'node + ts',
				],
			},
		])
		const { project } = answer
		const [projectType, langType] = project.split(' + ')
		return {
			projectType,
			langType,
		}
	} catch (error) {
		process.exit(1)
	}
}
