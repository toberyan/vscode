/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { TPromise } from 'vs/base/common/winjs.base';
import arrays = require('vs/base/common/arrays');

suite('Arrays', () => {
	test('findFirst', function () {
		const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];

		let idx = arrays.findFirst(array, e => e >= 0);
		assert.equal(array[idx], 1);

		idx = arrays.findFirst(array, e => e > 1);
		assert.equal(array[idx], 4);

		idx = arrays.findFirst(array, e => e >= 8);
		assert.equal(array[idx], 55);

		idx = arrays.findFirst(array, e => e >= 61);
		assert.equal(array[idx], 61);

		idx = arrays.findFirst(array, e => e >= 69);
		assert.equal(array[idx], 69);

		idx = arrays.findFirst(array, e => e >= 70);
		assert.equal(idx, array.length);

		idx = arrays.findFirst([], e => e >= 0);
		assert.equal(array[idx], 1);
	});

	test('stableSort', function () {
		let counter = 0;
		let data = arrays.fill(10000, () => ({ n: 1, m: counter++ }));

		arrays.mergeSort(data, (a, b) => a.n - b.n);

		let lastM = -1;
		for (const element of data) {
			assert.ok(lastM < element.m);
			lastM = element.m;
		}
	});

	test('mergeSort', function () {
		let data = arrays.mergeSort([6, 5, 3, 1, 8, 7, 2, 4], (a, b) => a - b);
		assert.deepEqual(data, [1, 2, 3, 4, 5, 6, 7, 8]);
	});

	test('mergeSort, is stable', function () {

		let numbers = arrays.mergeSort([33, 22, 11, 4, 99, 1], (a, b) => 0);
		assert.deepEqual(numbers, [33, 22, 11, 4, 99, 1]);
	});

	test('mergeSort, many random numbers', function () {

		function compare(a: number, b: number) {
			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		}

		function assertSorted(array: number[]) {
			let last = array[0];
			for (let i = 1; i < array.length; i++) {
				let n = array[i];
				if (last > n) {
					assert.fail(array.slice(i - 10, i + 10));
				}
			}
		}
		const MAX = 101;
		const data: number[][] = [];
		for (let i = 1; i < MAX; i++) {
			let array: number[] = [];
			for (let j = 0; j < 10 + i; j++) {
				array.push(Math.random() * 10e8 | 0);
			}
			data.push(array);
		}

		for (const array of data) {
			arrays.mergeSort(array, compare);
			assertSorted(array);
		}
	});

	test('sortedDiff', function () {
		function compare(a: number, b: number): number {
			return a - b;
		}

		let d = arrays.sortedDiff([1, 2, 4], [], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 3, toInsert: [] }
		]);

		d = arrays.sortedDiff([], [1, 2, 4], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 0, toInsert: [1, 2, 4] }
		]);

		d = arrays.sortedDiff([1, 2, 4], [1, 2, 4], compare);
		assert.deepEqual(d, []);

		d = arrays.sortedDiff([1, 2, 4], [2, 3, 4, 5], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 1, toInsert: [] },
			{ start: 2, deleteCount: 0, toInsert: [3] },
			{ start: 3, deleteCount: 0, toInsert: [5] },
		]);

		d = arrays.sortedDiff([2, 3, 4, 5], [1, 2, 4], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 0, toInsert: [1] },
			{ start: 1, deleteCount: 1, toInsert: [] },
			{ start: 3, deleteCount: 1, toInsert: [] },
		]);

		d = arrays.sortedDiff([1, 3, 5, 7], [5, 9, 11], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 2, toInsert: [] },
			{ start: 3, deleteCount: 1, toInsert: [9, 11] }
		]);

		d = arrays.sortedDiff([1, 3, 7], [5, 9, 11], compare);
		assert.deepEqual(d, [
			{ start: 0, deleteCount: 3, toInsert: [5, 9, 11] }
		]);
	});

	test('delta sorted arrays', function () {
		function compare(a: number, b: number): number {
			return a - b;
		}

		let d = arrays.delta([1, 2, 4], [], compare);
		assert.deepEqual(d.removed, [1, 2, 4]);
		assert.deepEqual(d.added, []);

		d = arrays.delta([], [1, 2, 4], compare);
		assert.deepEqual(d.removed, []);
		assert.deepEqual(d.added, [1, 2, 4]);

		d = arrays.delta([1, 2, 4], [1, 2, 4], compare);
		assert.deepEqual(d.removed, []);
		assert.deepEqual(d.added, []);

		d = arrays.delta([1, 2, 4], [2, 3, 4, 5], compare);
		assert.deepEqual(d.removed, [1]);
		assert.deepEqual(d.added, [3, 5]);

		d = arrays.delta([2, 3, 4, 5], [1, 2, 4], compare);
		assert.deepEqual(d.removed, [3, 5]);
		assert.deepEqual(d.added, [1]);

		d = arrays.delta([1, 3, 5, 7], [5, 9, 11], compare);
		assert.deepEqual(d.removed, [1, 3, 7]);
		assert.deepEqual(d.added, [9, 11]);

		d = arrays.delta([1, 3, 7], [5, 9, 11], compare);
		assert.deepEqual(d.removed, [1, 3, 7]);
		assert.deepEqual(d.added, [5, 9, 11]);
	});

	test('binarySearch', function () {
		function compare(a: number, b: number): number {
			return a - b;
		}
		const array = [1, 4, 5, 7, 55, 59, 60, 61, 64, 69];

		assert.equal(arrays.binarySearch(array, 1, compare), 0);
		assert.equal(arrays.binarySearch(array, 5, compare), 2);

		// insertion point
		assert.equal(arrays.binarySearch(array, 0, compare), ~0);
		assert.equal(arrays.binarySearch(array, 6, compare), ~3);
		assert.equal(arrays.binarySearch(array, 70, compare), ~10);

	});

	test('distinct', function () {
		function compare(a: string): string {
			return a;
		}

		assert.deepEqual(arrays.distinct(['32', '4', '5'], compare), ['32', '4', '5']);
		assert.deepEqual(arrays.distinct(['32', '4', '5', '4'], compare), ['32', '4', '5']);
		assert.deepEqual(arrays.distinct(['32', 'constructor', '5', '1'], compare), ['32', 'constructor', '5', '1']);
		assert.deepEqual(arrays.distinct(['32', 'constructor', 'proto', 'proto', 'constructor'], compare), ['32', 'constructor', 'proto']);
		assert.deepEqual(arrays.distinct(['32', '4', '5', '32', '4', '5', '32', '4', '5', '5'], compare), ['32', '4', '5']);
	});

	test('top', function () {
		const cmp = (a: number, b: number) => {
			assert.strictEqual(typeof a, 'number', 'typeof a');
			assert.strictEqual(typeof b, 'number', 'typeof b');
			return a - b;
		};

		assert.deepEqual(arrays.top([], cmp, 1), []);
		assert.deepEqual(arrays.top([1], cmp, 0), []);
		assert.deepEqual(arrays.top([1, 2], cmp, 1), [1]);
		assert.deepEqual(arrays.top([2, 1], cmp, 1), [1]);
		assert.deepEqual(arrays.top([1, 3, 2], cmp, 2), [1, 2]);
		assert.deepEqual(arrays.top([3, 2, 1], cmp, 3), [1, 2, 3]);
		assert.deepEqual(arrays.top([4, 6, 2, 7, 8, 3, 5, 1], cmp, 3), [1, 2, 3]);
	});

	test('topAsync', function (done) {
		const cmp = (a: number, b: number) => {
			assert.strictEqual(typeof a, 'number', 'typeof a');
			assert.strictEqual(typeof b, 'number', 'typeof b');
			return a - b;
		};

		testTopAsync(cmp, 1)
			.then(() => {
				return testTopAsync(cmp, 2);
			})
			.then(done, done);
	});

	function testTopAsync(cmp: any, m: number) {
		return TPromise.as(null).then(() => {
			return arrays.topAsync([], cmp, 1, m)
				.then(result => {
					assert.deepEqual(result, []);
				});
		}).then(() => {
			return arrays.topAsync([1], cmp, 0, m)
				.then(result => {
					assert.deepEqual(result, []);
				});
		}).then(() => {
			return arrays.topAsync([1, 2], cmp, 1, m)
				.then(result => {
					assert.deepEqual(result, [1]);
				});
		}).then(() => {
			return arrays.topAsync([2, 1], cmp, 1, m)
				.then(result => {
					assert.deepEqual(result, [1]);
				});
		}).then(() => {
			return arrays.topAsync([1, 3, 2], cmp, 2, m)
				.then(result => {
					assert.deepEqual(result, [1, 2]);
				});
		}).then(() => {
			return arrays.topAsync([3, 2, 1], cmp, 3, m)
				.then(result => {
					assert.deepEqual(result, [1, 2, 3]);
				});
		}).then(() => {
			return arrays.topAsync([4, 6, 2, 7, 8, 3, 5, 1], cmp, 3, m)
				.then(result => {
					assert.deepEqual(result, [1, 2, 3]);
				});
		});
	}
});

