-- 创建网站表
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    url VARCHAR(500) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    custom_logo TEXT,
    section VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_websites_section ON websites(section);
CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites(created_at);

-- 插入初始数据
INSERT INTO websites (name, description, url, tags, custom_logo, section) VALUES
-- 融资信息
('RootData', '专业的区块链项目数据库，提供最新的融资信息和项目分析', 'https://cn.rootdata.com/', '{"融资", "数据", "分析"}', '/logos/rootdata.png', 'funding'),
('Xhunt', 'Chrome扩展，帮助发现和跟踪区块链项目的融资动态', 'https://chromewebstore.google.com/detail/gonmfafjcdkngkbhcpmcphlgfhabkeji', '{"Chrome扩展", "融资", "跟踪"}', '/logos/xhunt.png', 'funding'),
('OmniCrypto', '需要邀请码', 'https://chromewebstore.google.com/detail/anfhckfacchppnodiocnmhcjdgbhahmd', '{"投资", "邀请制", "Chrome扩展"}', '/logos/omnicrypto.jpeg', 'funding'),

-- 交易数据工具
('Coinglass', '合约数据分析', 'https://www.coinglass.com/zh', '{"合约", "数据分析", "期货"}', '/logos/coinglass.png', 'tradingData'),
('Binance Futures', '币安合约数据', 'https://www.binance.com/zh-CN/futures/funding-history/perpetual/trading-data', '{"币安", "合约", "交易数据"}', '/logos/binance.jpeg', 'tradingData'),
('CoinMarketCap', '数字货币行情分析', 'https://coinmarketcap.com/zh/', '{"行情", "分析", "市值"}', '/logos/coinmarketcap.png', 'tradingData'),
('Tokenomist', '代币解锁等', 'https://tokenomist.ai/', '{"代币", "解锁", "分析"}', '/logos/tokenomist.png', 'tradingData'),
('DefiLlama', '羊驼，查defi相关数据', 'https://defillama.com/', '{"DeFi", "数据", "TVL"}', '/logos/defillama.jpeg', 'tradingData'),

-- 领水网站
('Faucet Link', 'Goerli测试网络水龙头，免费获取测试ETH', 'https://faucetlink.to/', '{"Goerli", "ETH", "测试网"}', '/logos/faucet-link.png', 'faucet'),
('QuickNode Goerli', 'QuickNode提供的Goerli测试网ETH水龙头', 'https://faucet.quicknode.com/ethereum/goerli', '{"Goerli", "ETH", "QuickNode"}', '/logos/quicknode.png', 'faucet'),
('Paradigm Faucet', 'Paradigm提供的以太坊测试网水龙头', 'https://faucet.paradigm.xyz/', '{"ETH", "测试网", "Paradigm"}', '/logos/paradigm-faucet.png', 'faucet'),
('Alchemy Sepolia', 'Alchemy提供的Sepolia测试网ETH水龙头', 'https://www.alchemy.com/faucets/ethereum-sepolia', '{"Sepolia", "ETH", "Alchemy"}', '/logos/alchemy.png', 'faucet'),
('BNB Chain Testnet', 'BNB智能链测试网水龙头，获取测试BNB', 'https://faucets.chain.link/bnb-chain-testnet', '{"BNB", "测试网", "BSC"}', '/logos/bnb-testnet.jpeg', 'faucet'),
('Sui Faucet', 'Sui区块链测试网水龙头', 'https://faucet.blockbolt.io/', '{"Sui", "测试网"}', '/logos/sui.jpeg', 'faucet'),
('Bitcoin Testnet', '比特币测试网水龙头，获取测试BTC', 'https://faucet.opnet.org/', '{"Bitcoin", "测试网", "BTC"}', '/logos/bitcoin-testnet.png', 'faucet'),
('Solana Faucet', 'Solana测试网水龙头，获取测试SOL', 'https://solfaucet.com/', '{"Solana", "SOL", "测试网"}', '/logos/solana.jpg', 'faucet'),
('OKX领水中心', 'OKX提供的多链测试网水龙头服务', 'https://web3.okx.com/zh-hans/faucet', '{"多链", "OKX", "测试网"}', '/logos/okx-faucet.png', 'faucet'),

-- 空投网站
('鱼泡泡空投网站', '专业的空投信息聚合平台，及时获取最新空投机会', 'https://www.airdrop-yupaopao.xyz/', '{"空投", "聚合", "机会"}', '/logos/yupaopao-airdrop.png', 'airdrop'),

-- 小白教程
('Web3小白教程', '最全入门指南，created by 柴郡 https://x.com/0xCheshire', 'https://pale-blackberry-88c.notion.site/17bf1b18f5d380598595d5306f6540f9', '{"教程", "Web3", "新手"}', '/logos/notion-tutorial.png', 'tutorial'),

-- 交易所邀请
('Binance币安', '全球最大的加密货币交易所，通过我的邀请链接注册享受最高40%手续费优惠', 'https://www.marketwebb.systems/join?ref=865223788', '{"交易所", "Binance", "邀请"}', '/logos/binance.jpeg', 'exchange'),
('OKX欧易', '知名加密货币交易平台，支持现货、合约、期权交易', 'https://okx.com/join/46997457', '{"交易所", "OKX", "邀请"}', '/logos/okx-exchange.png', 'exchange')

ON CONFLICT DO NOTHING;
