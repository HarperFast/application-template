import {Resource} from 'harperdb';

export class greeting extends Resource {
	static loadAsInstance = false;

	async get() {
		return { greeting: 'Hello, world!' };
	}
}
