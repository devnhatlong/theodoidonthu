import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Col, DatePicker, Form, Row, Space } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import letterService from '../../services/letterService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../../components/Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import Moment from 'react-moment';
import viVN from 'antd/es/date-picker/locale/vi_VN';

export const LetterComponent = () => {
    const [modalForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({});
    const queryClient = useQueryClient();
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5 // Số lượng mục trên mỗi trang
    });

    const [stateLetter, setStateLetter] = useState({
        soDen: "",
        ngayDen: "",
        soVanBan: "",
        ngayDon: "",
        nguoiGui: "",
        diaChi: "",
        lanhDao: "",
        chuyen1: "",
        chuyen2: "",
        ghiChu: "",
        trichYeu: ""
    });

    const [stateLetterDetail, setStateLetterDetail] = useState({
        soDen: "",
        ngayDen: "",
        soVanBan: "",
        ngayDon: "",
        nguoiGui: "",
        diaChi: "",
        lanhDao: "",
        chuyen1: "",
        chuyen2: "",
        ghiChu: "",
        trichYeu: ""
    });
    
    const mutation = useMutationHooks(
        (data) => {
            const { 
                soDen,
                ngayDen,
                soVanBan,
                ngayDon,
                nguoiGui,
                diaChi,
                lanhDao,
                chuyen1,
                chuyen2,
                ghiChu,
                trichYeu 
            } = data;

            const response = letterService.createLetter({
                soDen,
                ngayDen,
                soVanBan,
                ngayDon,
                nguoiGui,
                diaChi,
                lanhDao,
                chuyen1,
                chuyen2,
                ghiChu,
                trichYeu 
            });

            return response;
        }
    )
    // const mutationUpdate = useMutationHooks(
    //     (data) => { 
    //       const { ...rests } = data;
    
    //       const response = letterService.createLetter(id, token, { ...rests });
    
    //       return response;
    //     }
    // );
    
    // const mutationDeleted = useMutationHooks(
    //     (data) => { 
    //       const { id, token } = data;
    
    //       const res = ProductService.deleteProduct(id, token);
    
    //       return res;
    //     }
    // );

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateLetter({
            soDen: "",
            ngayDen: "",
            soVanBan: "",
            ngayDon: "",
            nguoiGui: "",
            diaChi: "",
            lanhDao: "",
            chuyen1: "",
            chuyen2: "",
            ghiChu: "",
            trichYeu: ""
        });

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;

    const getAllLetter = async (currentPage, pageSize) => {
        const response = await letterService.getAllLetter(currentPage, pageSize);

        return response;
    }

    const queryLetter = useQuery({
        queryKey: ['letters'],
        queryFn: () => {
            if (!searchInput.current) {
                return getAllLetter(pagination.currentPage, pagination.pageSize);
            } else {
                return Promise.resolve(null); // Trả về một promise null nếu searchInput.current là null
            }
        },
        retry: 3,
        retryDelay: 1000,
    });

    const { isLoading: isLoadingLetter, data: letters } = queryLetter;

    useEffect(() => {
        if(isSuccess && data?.success) {
            message.success("Tạo đơn thư thành công");
            handleCancel();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !data?.success) {
            message.error(data?.message);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (!searchInput.current) {
            queryLetter.refetch();
        }
        // else if (searchInput.current || Object.keys(filters).length > 0) {
        //     searchLettersAndUpdateDataTable(filters, pagination.currentPage, pagination.pageSize);
        // }
    }, [pagination, filters]);

    const onFinish = async () => {
        mutation.mutate(stateLetter, {
            onSettled: () => {
              queryLetter.refetch();
            }
        });
    }

    useEffect(() => {
        if (letters?.letters) {
            const updatedDataTable = fetchDataForDataTable(letters);
            setDataTable(updatedDataTable);
        }
    }, [letters]);

    const fetchDataForDataTable = (lettersData) => {
        return lettersData?.letters.map((letter) => {
            return {
                ...letter, 
                key: letter._id,
                ngayDen: <Moment format="DD/MM/YYYY">{letter.ngayDen}</Moment>,
                ngayDon: <Moment format="DD/MM/YYYY">{letter.ngayDon}</Moment>,
                createdAt: new Date(letter.createdAt),
                updatedAt: new Date(letter.updatedAt),
            };
        });
    };

    const handleOnChange = (name, value) => {
        setStateLetter({
            ...stateLetter,
            [name]: value
        });
    };

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${placeholder}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, dataIndex)} // Truyền key của cột vào hàm handleReset
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined
            style={{
              color: filtered ? '#1677ff' : undefined,
            }}
          />
        ),
        onFilter: (value, record) =>
          record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
    });

    const renderAction = () => {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <EditOutlined style={{color: 'orange', fontSize: '18px', cursor: 'pointer'}} onClick={handleDetailLetter}/>
                <DeleteOutlined style={{color: 'red', fontSize: '18px', cursor: 'pointer'}} onClick={() => setIsModalOpenDelete(true)}/>
            </div>
        )
    }

    const columns = [
        {
            title: 'Số đến',
            dataIndex: 'soDen',
            sorter: (a, b) => a.soDen - b.soDen,
            ...getColumnSearchProps('soDen', 'số đến')
        },
        {
            title: 'Ngày đến',
            dataIndex: 'ngayDen',
            sorter: (a, b) => new Date(a.ngayDen) - new Date(b.ngayDen),
            ...getColumnSearchProps('ngayDen', 'ngày đến')
        },
        {
            title: 'Số VB',
            dataIndex: 'soVanBan',
            sorter: (a, b) => a.soVanBan - b.soVanBan,
            ...getColumnSearchProps('soVanBan', 'số văn bản')
        },
        {
            title: 'Ngày đơn',
            dataIndex: 'ngayDon',
            sorter: (a, b) => new Date(a.ngayDon) - new Date(b.ngayDon),
            ...getColumnSearchProps('ngayDon', 'ngày đơn')
        },
        {
            title: 'Người gửi',
            dataIndex: 'nguoiGui',
            ...getColumnSearchProps('nguoiGui', 'người gửi')
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'diaChi',
            ...getColumnSearchProps('diaChi', 'địa chỉ')
        },
        {
            title: 'Trích yếu',
            dataIndex: 'trichYeu',
            ...getColumnSearchProps('trichYeu', 'trích yếu')
        },
        {
            title: 'Lãnh đạo',
            dataIndex: 'lanhDao',
            ...getColumnSearchProps('lanhDao', 'lãnh đạo')
        },
        {
            title: 'Chuyển 1',
            dataIndex: 'chuyen1',
        },
        {
            title: 'Chuyển 2',
            dataIndex: 'chuyen2',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
        },
        {
          title: '',
          dataIndex: 'action',
          render: renderAction
        },
    ];

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        try {
            // Cập nhật object filters với các giá trị filter mới và gửi yêu cầu API sau khi state đã được cập nhật
            setFilters(prevState => {
                const updatedFilters = {
                    ...prevState,
                    [dataIndex]: selectedKeys[0]
                };
                searchLettersAndUpdateDataTable(updatedFilters, pagination.currentPage, pagination.pageSize);
                return updatedFilters;
            });
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error.message);
            message.error("Đã xảy ra lỗi khi tìm kiếm");
        }
    };
    
    const searchLettersAndUpdateDataTable = async (filters, currentPage, pageSize) => {
        try {
            const searchData = await letterService.searchLetters({ ...filters, currentPage, pageSize });
            console.log("searchData: ", searchData)
            if (searchData) {
                const updatedPagination = { ...pagination, currentPage: 1 }; // Reset trang về trang đầu khi tìm kiếm
                setPagination(updatedPagination);
                queryClient.setQueryData(['letters'], previousData => {
                    return {
                        ...previousData,
                        letters: searchData.letters, // Cập nhật lại dữ liệu với kết quả tìm kiếm mới
                        totalRecord: searchData.totalRecord // Cập nhật lại tổng số bản ghi
                    };
                });
                
                // Cập nhật lại dataTable với dữ liệu tìm kiếm mới
                const updatedDataTable = searchData.letters.map((letter) => {   
                    return {
                        ...letter, 
                        key: letter._id,
                        ngayDen: <Moment format="DD/MM/YYYY">{letter.ngayDen}</Moment>,
                        ngayDon: <Moment format="DD/MM/YYYY">{letter.ngayDon}</Moment>,
                        createdAt: new Date(letter.createdAt),
                        updatedAt: new Date(letter.updatedAt),
                    };
                });
                setDataTable(updatedDataTable);
            } else {
                throw new Error("Không tìm thấy kết quả phù hợp");
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error.message);
            message.error("Đã xảy ra lỗi khi tìm kiếm");
        }
    };      
    
    const handleReset = (clearFilters, dataIndex) => {
        clearFilters(); // Xóa filter của cột
        // Xóa giá trị filter tương ứng ra khỏi state filteredValues
        setFilters(prevState => {
            const newState = { ...prevState };
            delete newState[dataIndex];
            return newState;
        });
    };

    const handlePageChange = (page, pageSize) => {
        // Chỉ cập nhật pagination nếu nó thay đổi
        if (pagination.currentPage !== page || pagination.pageSize !== pageSize) {
            setPagination({
                ...pagination,
                currentPage: page,
                pageSize: pageSize
            });
        }
    };

    return (
        <div>
            <WrapperHeader>Quản lý đơn thư</WrapperHeader>
            <div style={{marginTop: "10px"}}>
                <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => setIsModalOpen(true)}><PlusOutlined style={{fontSize: "40px"}}/></Button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableComponent columns={columns} data={dataTable} isLoading={isLoadingLetter} 
                pagination={{
                    current: pagination.currentPage,
                    pageSize: pagination.pageSize,
                    total: letters?.totalRecord,
                    onChange: handlePageChange,
                }}/>
            </div>
            <ModalComponent forceRender title="Tạo đơn thư" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Loading isLoading = {isPending}>
                    <Form
                        name="modalForm"
                        labelCol={{ span: 13 }}
                        wrapperCol={{ span: 20 }}
                        style={{ maxWidth: 1500 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="on"
                        form={modalForm}
                    >
                        <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                            <Col span={8}> {/* Cột đầu tiên */}
                                <Form.Item
                                    label="Số đến"
                                    name="soDen"
                                    rules={[{ required: true, message: 'Vui lòng nhập số đến!' }]}
                                >
                                    <InputComponent type="number" name="soDen" value={stateLetter.soDen} onChange={(e) => handleOnChange('soDen', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}> {/* Cột thứ hai */}
                                <Form.Item
                                    label="Ngày đến"
                                    name="ngayDen"
                                    rules={[{ required: true, message: 'Vui lòng nhập ngày đến!' }]}
                                >
                                    <DatePicker 
                                        locale={viVN}
                                        format="DD/MM/YYYY"
                                        name="ngayDen" 
                                        value={stateLetter.ngayDen} 
                                        style={{ width: '100%' }} 
                                        onChange={(date) => handleOnChange('ngayDen', date)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}> {/* Cột thứ ba */}
                                <Form.Item
                                    label="Số văn bản"
                                    name="soVanBan"
                                >
                                    <InputComponent type="number" name="soVanBan" value={stateLetter.soVanBan} onChange={(e) => handleOnChange('soVanBan', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}> {/* Hàng mới */}
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày đơn"
                                    name="ngayDon"
                                    rules={[{ required: true, message: 'Vui lòng nhập ngày đơn!' }]}
                                >
                                    <DatePicker 
                                        locale={viVN} 
                                        format="DD/MM/YYYY"
                                        name="ngayDon" 
                                        value={stateLetter.ngayDon} 
                                        style={{ width: '100%' }} 
                                        onChange={(date) => handleOnChange('ngayDon', date)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Người gửi"
                                    name="nguoiGui"
                                    rules={[{ required: true, message: 'Vui lòng nhập người gửi!' }]}
                                >
                                    <InputComponent name="nguoiGui" value={stateLetter.nguoiGui} onChange={(e) => handleOnChange('nguoiGui', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name="diaChi"
                                    rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
                                >
                                    <InputComponent name="diaChi" value={stateLetter.diaChi} onChange={(e) => handleOnChange('diaChi', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}> {/* Hàng mới */}
                            <Col span={8}>
                                <Form.Item
                                    label="Lãnh đạo"
                                    name="lanhDao"
                                    rules={[{ required: true, message: 'Vui lòng nhập lãnh đạo!' }]}
                                >
                                    <InputComponent name="lanhDao" value={stateLetter.lanhDao} onChange={(e) => handleOnChange('lanhDao', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Chuyển 1"
                                    name="chuyen1"
                                >
                                    <InputComponent name="chuyen1" value={stateLetter.chuyen1} onChange={(e) => handleOnChange('chuyen1', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Chuyển 2"
                                    name="chuyen2"
                                >
                                    <InputComponent name="chuyen2" value={stateLetter.chuyen2} onChange={(e) => handleOnChange('chuyen2', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}> {/* Hàng mới */}
                            <Col span={24}>
                                <Form.Item
                                    label="Ghi chú"
                                    name="ghiChu"
                                    labelCol={{ span: 4 }}
                                >
                                    <InputComponent name="ghiChu" value={stateLetter.ghiChu} onChange={(e) => handleOnChange('ghiChu', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Trích yếu nội dung"
                                    name="trichYeu"
                                    labelCol={{ span: 4 }}
                                >
                                    <InputComponent name="trichYeu" value={stateLetter.trichYeu} onChange={handleOnChange} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item wrapperCol={{ offset: 21, span: 24 }}>
                            <Button type="primary" htmlType="submit">Thêm đơn thư</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
        </div>
    )
}
