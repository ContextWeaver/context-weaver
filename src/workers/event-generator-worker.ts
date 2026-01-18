import { parentPort, workerData } from 'worker_threads';
import { RPGEventGenerator } from '../RPGEventGenerator';
import { PlayerContext } from '../types';

if (!parentPort) {
  throw new Error('This script must be run as a worker thread');
}

const { count, context, options } = workerData as {
  count: number;
  context: PlayerContext;
  options: any;
};

// Create generator instance with the provided options
const generator = new RPGEventGenerator(options);

// Generate the requested number of events
const events = [];
for (let i = 0; i < count; i++) {
  const event = generator.generateEvent(context);
  events.push(event);
}

// Send the generated events back to the main thread
parentPort.postMessage(events);