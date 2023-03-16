import adapter from '@sveltejs/adapter-auto'
import adapter_node from '@sveltejs/adapter-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: process.env.ADAPTER_NODE ? adapter_node() : adapter()
	}
};

export default config;
