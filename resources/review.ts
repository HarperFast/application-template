import {tables} from 'harperdb';

export class review extends tables.Review {
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
}
