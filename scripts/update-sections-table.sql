-- 创建分区表
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认分区数据
INSERT INTO sections (id, name, icon, description, visible, sort_order) VALUES
('funding', '融资信息', '🚀', '区块链项目融资动态', true, 1),
('tradingData', '交易数据工具', '📊', '交易分析和数据工具', true, 2),
('faucet', '领水网站', '💧', '测试网水龙头服务', true, 3),
('airdrop', '空投网站', '🎁', '空投信息和机会', true, 4),
('tutorial', '小白教程', '📚', 'Web3入门教程', true, 5),
('exchange', '交易所邀请', '💱', '交易所推荐链接', true, 6)
ON CONFLICT (id) DO NOTHING;

-- 为网站表添加外键约束（可选）
-- ALTER TABLE websites ADD CONSTRAINT fk_websites_section 
-- FOREIGN KEY (section) REFERENCES sections(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_sections_visible ON sections(visible);
