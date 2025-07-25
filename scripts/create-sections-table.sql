-- 创建分区管理表
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10) DEFAULT '📁',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);

-- 插入默认分区数据
INSERT INTO sections (key, title, icon, sort_order, is_active) VALUES
('funding', '融资信息', '🚀', 1, true),
('tradingData', '交易数据工具', '📊', 2, true),
('faucet', '领水网站', '💧', 3, true),
('airdrop', '空投网站', '🎁', 4, true),
('tutorial', '小白教程', '📚', 5, true),
('exchange', '交易所邀请', '💱', 6, true)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
