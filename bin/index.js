#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const standard = require('../lib/index')
const { pkgJson } = require('../lib/utils')
const program = new Command()
program.version(pkgJson().version)
program
	.name('standard')
	.description('A cli for front end developing standard ')
	.option('-i, --init [type]', 'init all standard by default')
	.option('-h, --husky [type]', 'init husky standard by default')
	.option('-e, --eslint [type]', 'init eslint standard by default')
	.option('-p, --prettier [type]', 'init prettier standard by default')
	.option('-g, --ignore [type]', 'init ignore file standard by default')
	.action(option => {
		new standard(option)
	})
program.parse(process.argv)
