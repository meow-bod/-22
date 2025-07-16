'use client';

import React, { useState, useMemo } from 'react';
import { Sitter } from '@/types';
import { Input, Button, Label, FormGroup } from '@/components/ui/Form';

interface SearchResultListProps {
  sitters: Sitter[];
}

const SearchResultList: React.FC<SearchResultListProps> = ({ sitters }) => {
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filteredSitters = useMemo(() => {
    return sitters.filter(sitter => {


      const locationMatch = location ? sitter.service_area?.includes(location) : true;
      // 服務類型的篩選邏輯可以未來擴充
      const keywordMatch = keyword 
        ? (sitter.full_name?.toLowerCase().includes(keyword.toLowerCase()) || 
           sitter.introduction?.toLowerCase().includes(keyword.toLowerCase())) 
        : true;

      return locationMatch && keywordMatch;
    });
  }, [sitters, location, serviceType, keyword]);

  return (
    <div>
      {/* 篩選表單 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormGroup>
            <Label htmlFor="location">地點</Label>
            <Input 
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：台中市"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="service-type">服務類型 (開發中)</Label>
            <select 
              id="service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-gray-100 cursor-not-allowed"
              disabled
            >
              <option value="all">所有服務</option>
            </select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="keyword">關鍵字</Label>
            <Input 
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋保姆姓名或介紹"
            />
          </FormGroup>
        </div>
      </div>

      {/* 搜尋結果 */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">搜尋結果 ({filteredSitters.length})</h2>
        {filteredSitters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSitters.map(sitter => {

              return (
                <div key={sitter.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-brand mb-2">{sitter.full_name}</h3>
                  <p className="text-text-subtle mb-2">地區：{sitter.service_area}</p>
                  <p className="text-text-subtle mb-4">時薪：${sitter.price_per_hour}</p>
                  <p className="text-text-main mb-4 h-24 overflow-hidden">{sitter.introduction}</p>
                  <Button className="w-full">查看詳情</Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <p className="text-text-subtle">找不到符合條件的保姆。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultList;