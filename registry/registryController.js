import Router from 'koa-router';
import { renderJson } from '../utils.js';

function RegistryController(registry) {
  function summary(chain) {
    const { chain_name, network_type, pretty_name, chain_id } = chain.chain;
    const baseAsset = chain.assets && chain.assets[0];
    return {
      directory: chain.directory,
      chain_name,
      network_type,
      pretty_name,
      chain_id,
      status: chain.status,
      symbol: baseAsset && baseAsset.symbol,
      coingecko_id: baseAsset && baseAsset.coingecko_id,
      image: baseAsset && baseAsset.image,
      apis: chain.apis
    };
  }

  function routes() {
    const router = new Router();

    router.get('/', async (ctx, next) => {
      const chains = await registry.getChains()
      renderJson(ctx, chains.map(chain => {
        return summary(chain);
      }));
    });

    router.get('/:chain', async (ctx, next) => {
      const chain = await registry.getChain(ctx.params.chain);
      renderJson(ctx, chain && summary(chain));
    });

    router.get('/:chain/chain', async (ctx, next) => {
      const chain = await registry.getChain(ctx.params.chain);
      renderJson(ctx, chain && chain.chain);
    });

    router.get('/:chain/assetlist', async (ctx, next) => {
      const chain = await registry.getChain(ctx.params.chain);
      renderJson(ctx, chain && chain.assetlist);
    });

    return router.routes();
  }

  return {
    routes
  };
}

export default RegistryController