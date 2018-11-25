// tslint:disable no-any

import {EventEmitter} from 'events';
import * as React from 'react';
import {render, RenderResult} from 'react-testing-library';
import {useReplicant} from '..';

const replicantHandler = jest.fn();
const replicantRemoveListener = jest.fn();

// Intercept mock function
class Replicant extends EventEmitter {
	on(event: string, payload: any) {
		replicantHandler(event, payload);
		return super.on(event, payload);
	}
	removeListener(event: string, listener: () => void) {
		replicantRemoveListener();
		return super.removeListener(event, listener);
	}
}

const replicant = new Replicant();
const replicantConstructor = jest.fn(() => replicant);

(global as any).nodecg = {
	Replicant: replicantConstructor,
};

const RunnerName = () => {
	const [currentRun] = useReplicant('currentRun', {runner: {name: 'foo'}});
	return <div>{currentRun.runner.name}</div>;
};

let renderResult: RenderResult;
beforeEach(() => {
	renderResult = render(<RunnerName />);
});

test('Initializes replicant correctly', () => {
	expect(replicantConstructor).toBeCalledWith('currentRun', {
		defaultValue: {
			runner: {name: 'foo'},
		},
	});
});

test('Change handler is set correctly', () => {
	expect(replicantHandler).toBeCalledTimes(1);
});

test.skip('Handles replicant changes', async () => {
	replicant.emit('change', {runner: {name: 'bar'}});
	renderResult.rerender(<RunnerName />);
	expect(renderResult.container.textContent).toBe('bar');
});

test('Unlistens when unmounted', () => {
	renderResult.unmount();
	expect(replicantRemoveListener).toBeCalledTimes(1);
});
