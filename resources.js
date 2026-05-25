import { Resource } from 'harper';

/** Here we can define any JavaScript-based resources and extensions to tables
import {tables} from 'harper';

export class MyCustomResource extends tables.TableName {
	// we can define our own custom POST handler
	static async post(target, data, context) {
		// do something with the incoming content;
		return super.post(target, data, context);
	}
	// or custom GET handler
	static async get(target, context) {
		// we can modify this resource before returning
		return super.get(target, context);
	}
}
 */
// we can also define a custom resource without a specific table
export class Greeting extends Resource {
	// a "Hello, world!" handler
	static get(target, context) {
		return { greeting: 'Hello, world!' };
	}
}
