import {tables} from 'harperdb';

export class product extends tables.Product {
	static loadAsInstance = false;

	allowRead(user, target) {
		return true;
	}

	allowCreate(user, newData, target) {
		return true;
	}

	allowUpdate(user, updatedData, target) {
		return true;
	}

	allowDelete(user, target) {
		return true;
	}

	async* search(target) {
		const results = super.search(target);
		for await (const result of results) {
			result.name += '!';
			yield result;
		}
	}
}
