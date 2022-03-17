const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const path = require('path')
const Chain = require('./chain')

const ChainRegistry = (repoDir, branch) => {
  let chains = {}

  const setConfig = () => {
    return git.setConfig({
      fs,
      dir: repoDir,
      path: 'user.name',
      value: 'ECO Stake'
    })
  }

  const updateRepo = async () => {
    await setConfig()
    await git.fetch({ fs, http, dir: repoDir, ref: branch })
    await git.checkout({ fs, dir: repoDir, ref: `origin/${branch}`, force: true })
  }

  const chainNames = () => {
    return Object.keys(chains)
  }

  const getChains = () => {
    return Object.values(chains)
  }

  const getChain = (name) => {
    return chains[name]
  }

  const fetchChain = (dir) => {
    const chainPath = path.join(repoDir, dir, 'chain.json')
    const assetListPath = path.join(repoDir, dir, 'assetlist.json')
    const chainData = fs.readFileSync(chainPath)
    const assetListData = fs.existsSync(assetListPath) ? fs.readFileSync(assetListPath) : undefined
    const chainJson = JSON.parse(chainData)
    const assetListJson = assetListData && JSON.parse(assetListData)
    const existing = getChain(dir)

    return Chain(dir, chainJson, assetListJson, existing)
  }

  const refresh = async () => {
    try {
      await updateRepo()
      loadChains()
    } catch (error) {
      console.log('Failed to update repository', error)
    }
  }

  const loadChains = () => {
    const directories = fs.readdirSync(repoDir, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    const newChains = directories.reduce((sum, dir) => {
      if(dir.startsWith('.') || dir === 'testnets') return sum

      sum[dir] = fetchChain(dir)

      return sum
    }, {})

    chains = newChains
    console.log('Loaded chains', chainNames())
    return chains
  }

  return {
    refresh,
    getChains,
    getChain,
    chainNames
  }
}

module.exports = ChainRegistry