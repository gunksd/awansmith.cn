-- 创建分区表
CREATE TABLE IF NOT EXISTS sections (
  key VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 初始化默认分区数据
INSERT INTO sections (key, title, emoji, display_order) VALUES
('funding', '融资信息', '🚀', 1),
('tradingData', '交易数据工具', '📊', 2),
('faucet', '领水网站', '💧', 3),
('airdrop', '空投网站', '🎁', 4),
('tutorial', '小白教程', '📚', 5),
('exchange', '交易所邀请', '💱', 6)
ON CONFLICT (key) DO NOTHING;

-- 确保websites表的section字段是外键
ALTER TABLE websites ADD CONSTRAINT fk_website_section
  FOREIGN KEY (section) REFERENCES sections(key)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
