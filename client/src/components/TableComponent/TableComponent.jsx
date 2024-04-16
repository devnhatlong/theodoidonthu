import React, { useState, useEffect } from 'react'
import { Table } from 'antd';
import Loading from '../LoadingComponent/Loading';

const TableComponent = (props) => {
  const { selectionType = 'checkbox', data = [], isLoading = false, columns = [], handleDeleteMultiple, resetSelection } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [resetSelection]);

  const handleDeleteAll = () => {
    handleDeleteMultiple(selectedRowKeys);
  }

  return (
    <Loading isLoading={isLoading}>
        {selectedRowKeys.length > 0 && (
          <div style={{ backgroundColor: '#1677ff', color: '#fff', fontWeight: 'bold', padding: '10px', cursor: 'pointer'}} onClick={handleDeleteAll}>
            Xóa tất cả
          </div>
        )}
        <Table
          rowSelection={{
          type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          dataSource={data}
          {...props}
          bordered
        />
    </Loading>
  )
}

export default TableComponent