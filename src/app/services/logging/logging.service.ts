import { Injectable } from '@angular/core';

export interface Logger {
	error(msg: string): void;
	warn(msg: string): void;
	info(msg: string): void;
	debug(msg: string): void;
	trace(msg: string): void;
}

export enum LogLevel {
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR
}

// TODO take log level into account
class DefaultLogger implements Logger {
	private name: string;
	private level: LogLevel;

	constructor(name: string, level: LogLevel) {
		this.name = name;
		this.level = level;
	}

	private formatMessage(msg: string): string {
		return  Date.now().toString() + ' [' + LogLevel[this.level] + '] [' + this.name + '] ' + msg;
	}

	public trace(msg: string) {
		console.log(this.formatMessage(msg));
	}

	public debug(msg: string) {
		console.log(this.formatMessage(msg));
	}

	public info(msg: string) {
		console.log(this.formatMessage(msg));
	}

	public warn(msg: string) {
		console.log(this.formatMessage(msg));
	}

	public error(msg: string) {
		console.log(this.formatMessage(msg));
	}

}

@Injectable()
export class LoggingService {

	constructor() { }

	getLogger(name: string): Logger {
		return new DefaultLogger(name, LogLevel.TRACE);
	}
}
