import React, { useState, useEffect } from "react";
import { Card, Spin, Input, List, Typography, Empty } from "antd";
import axios from "axios";
const { Search } = Input;
const { Title, Text } = Typography;

export default function DocViewer() {
  const [structure, setStructure] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/docs/structure");
      if (response.data.success) {
        setStructure(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch structure:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async (filePath) => {
    try {
      setLoading(true);
      const response = await axios.get("/docs/content", { params: { filePath } });
      if (response.data.success) {
        setContent(response.data.data.html);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      fetchStructure();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get("/docs/search", { params: { q: value } });
      if (response.data.success) {
        setStructure(response.data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Search
          placeholder="搜索文档..."
          allowClear
          enterButton
          onSearch={handleSearch}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />
        {loading && <Spin />}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 300 }}>
            <List
              dataSource={structure}
              renderItem={(item) => (
                <List.Item>
                  {item.type === "directory" ? (
                    <Text strong>{item.name}</Text>
                  ) : (
                    <a onClick={() => fetchContent(item.path)}>{item.title || item.name}</a>
                  )}
                </List.Item>
              )}
            />
          </div>
          <div style={{ flex: 1 }}>
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <Empty description="选择文档查看内容" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
