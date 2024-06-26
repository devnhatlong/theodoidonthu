import React, { useEffect, useState, useRef } from 'react';
import { WrapperHeader } from './style';
import { Button, Col, DatePicker, Form, Row, Space, Upload } from "antd";
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import letterService from '../../services/letterService';
import Loading from '../LoadingComponent/Loading';
import * as message from '../../components/Message/Message';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, 
        UploadOutlined, EyeOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons'
import Moment from 'react-moment';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import moment from 'moment';
import * as ExcelJS from 'exceljs';

export const LetterComponent = () => {
    const [modalForm] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState();
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isLoadingResetFilter, setIsLoadingResetFilter] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const user = useSelector((state) => state?.user);
    const searchInput = useRef(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [dataTable, setDataTable] = useState([]);
    const [filters, setFilters] = useState({});
    const [resetSelection, setResetSelection] = useState(false);
    const [tuNgayMoment, setTuNgayMoment] = useState(null);
    const [denNgayMoment, setDenNgayMoment] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewFileUrl, setPreviewFileUrl] = useState('');
    const [previewFileUrlDetail, setPreviewFileUrlDetail] = useState('');
    const [previewModalDetailOpen, setPreviewModalDetailOpen] = useState(false);
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
        trichYeu: "",
        uploadedFiles: []
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
        trichYeu: "",
        uploadedFiles: []
    });
    
    const [attachedFiles, setAttachedFiles] = useState(stateLetterDetail.uploadedFiles);

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
                trichYeu,
                uploadedFiles
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
                trichYeu,
                uploadedFiles
            });

            return response;
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => { 
            const { id, ...rests } = data;
            const response = letterService.updateLetter(id, { ...rests });
            return response;
        }
    );
    
    const mutationDeleted = useMutationHooks(
        (data) => { 
          const { id } = data;
    
          const res = letterService.deleteLetter(id);
    
          return res;
        }
    );

    const mutationDeletedMultiple = useMutationHooks(
        (data) => { 
          const { ids } = data;
          const res = letterService.deleteMultipleLetters(ids);
    
          return res;
        }
    );

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
            trichYeu: "",
            uploadedFiles: []
        });

        setUploadedFiles([]);

        modalForm.resetFields();
    }

    const { data, isSuccess, isError, isPending } = mutation;
    const { data: dataUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated, isPending: isPendingUpdated } = mutationUpdate;
    const { data: dataDeleted, isSuccess: isSuccessDeleted, isError: isErrorDeleted, isPending: isLoadingDeleted } = mutationDeleted;
    const { data: dataDeletedMultiple, isSuccess: isSuccessDeletedMultiple, isError: isErrorDeletedMultiple, isPending: isLoadingDeletedMultiple } = mutationDeletedMultiple;

    const getAllLetter = async (currentPage, pageSize, filters) => {
        const response = await letterService.getAllLetter(currentPage, pageSize, filters);
        return response;
    };

    const fetchGetDetailLetter = async (rowSelected) => {
        const response = await letterService.getDetailLetter(rowSelected);

        if (response?.letter) {
            setStateLetterDetail({
                soDen: response?.letter?.soDen,
                ngayDen: response?.letter?.ngayDen,
                soVanBan: response?.letter?.soVanBan,
                ngayDon: response?.letter?.ngayDon,
                nguoiGui: response?.letter?.nguoiGui,
                diaChi: response?.letter?.diaChi,
                lanhDao: response?.letter?.lanhDao,
                chuyen1: response?.letter?.chuyen1,
                chuyen2: response?.letter?.chuyen2,
                ghiChu: response?.letter?.ghiChu,
                trichYeu: response?.letter?.trichYeu,
                uploadedFiles: response?.letter?.files
            })
        }
        setIsLoadingUpdate(false);
    }

    useEffect(() => {
        drawerForm.setFieldsValue(stateLetterDetail)
    }, [stateLetterDetail, drawerForm])

    useEffect(() => {
        if (rowSelected) {
            setIsLoadingUpdate(true);
            fetchGetDetailLetter(rowSelected);
        }
    }, [rowSelected])

    useEffect(() => {
        setAttachedFiles(stateLetterDetail.uploadedFiles);
    }, [stateLetterDetail.uploadedFiles]);

    const handleDetailLetter = () => {
        setIsOpenDrawer(true);
    }

    useEffect(() => {
        queryLetter.refetch();
        setIsLoadingResetFilter(false);
    }, [isLoadingResetFilter]);

    const handleResetAllFilter = () => {
        setIsLoadingResetFilter(true);
        setColumnFilters("");
        setFilters("");
        setTuNgayMoment("");
        setDenNgayMoment("");
    }

    const queryLetter = useQuery({
        queryKey: ['letters'],
        queryFn: () => getAllLetter(pagination.currentPage, pagination.pageSize, filters),
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
        if(isSuccessUpdated && dataUpdated?.success) {
            message.success("Cập nhật đơn thư thành công");
            handleCloseDrawer();
        }
        else if (isError) {
            message.error("Có gì đó sai sai");
        }
        else if (isSuccess && !dataUpdated?.success) {
            message.error(dataUpdated?.message);
        }
    }, [isSuccessUpdated]);

    useEffect(() => {
        if(isSuccessDeleted && dataDeleted?.success) {
            message.success(`Đã xóa đơn thư với số đến: ${dataDeleted.deletedLetter.soDen}`);
            handleCancelDelete();
        }
        else if (isErrorDeleted) {
          message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeleted])

    useEffect(() => {
        if (isSuccessDeletedMultiple && dataDeletedMultiple) {
            if (dataDeletedMultiple.deletedLetter.deletedCount > 0) {
                message.success("Xóa đơn thư thành công");
            } else {
                message.error("Không có đơn thư nào được xóa");
            }
        } else if (isErrorDeletedMultiple) {
            message.error("Có gì đó sai sai");
        }
    }, [isSuccessDeletedMultiple, isErrorDeletedMultiple, dataDeletedMultiple]);

    useEffect(() => {
        queryLetter.refetch();
    }, [pagination]);

    const onFinish = async () => {
        mutation.mutate(stateLetter, {
            onSettled: () => {
              queryLetter.refetch();
            }
        });
    }
    const onUpdateLetter = async () => {
        // Lấy dữ liệu từ stateLetterDetail và đổi tên key uploadedFiles thành files
        const { uploadedFiles, ...letterData } = stateLetterDetail;
        const updatedLetterData = { ...letterData };
    
        mutationUpdate.mutate(
            {
                id: rowSelected,
                ...updatedLetterData
            }, 
            {
                onSettled: () => {
                    queryLetter.refetch();
                }
            }
        );
    }

    const handleDeleteLetter = () => {
        mutationDeleted.mutate(
          {
            id: rowSelected
          },
          {
            onSettled: () => {
                queryLetter.refetch();
            }
          }
        )
    }

    const handleDeleteMultipleLetters = (ids) => {
        mutationDeletedMultiple.mutate(
          {
            ids: ids,
          },
          {
            onSettled: () => {
                queryLetter.refetch();
                setResetSelection(prevState => !prevState);
            }
          }
        )
    }

    useEffect(() => {
        if (letters?.letters) {
            const updatedDataTable = fetchDataForDataTable(letters);
            setDataTable(updatedDataTable);
        }
    }, [letters]);

    const fetchDataForDataTable = (lettersData) => {
        return lettersData?.letters?.map((letter) => {
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

    const handleOnChangeDetail = (name, value) => {
        setStateLetterDetail({
            ...stateLetterDetail,
            [name]: value
        });
    };

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
                    value={columnFilters[dataIndex] || ''}
                    onChange={(e) => {
                        const newFilters = { ...columnFilters, [dataIndex]: e.target.value };
                        setColumnFilters(newFilters);
                        setSelectedKeys(e.target.value ? [e.target.value] : []);
                    }}
                    onPressEnter={() => handleSearch(columnFilters, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(columnFilters, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
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

    const getDateRangeFilterProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Space>
                    <DatePicker.RangePicker
                        format="DD/MM/YYYY"
                        value={tuNgayMoment && denNgayMoment ? [tuNgayMoment, denNgayMoment] : []}
                        onChange={dates => {
                            const tuNgay = moment(new Date(dates[0].startOf('day'))).format('DD/MM/YYYY');
                            const denNgay = moment(new Date(dates[1].startOf('day'))).format('DD/MM/YYYY');
                            setTuNgayMoment(dates[0]);
                            setDenNgayMoment(dates[1]);
                            setColumnFilters(prevFilters => ({
                                ...prevFilters,
                                tuNgay,
                                denNgay
                            }));

                            // Cập nhật giá trị selectedKeys
                            setSelectedKeys(dates ? [dates[0].startOf('day'), dates[1].endOf('day')] : []);
                        }}
                        onPressEnter={() => handleSearchDateRange(selectedKeys, confirm)}
                        placeholder={['Từ ngày', 'Đến ngày']}
                        allowClear={false}
                    />
                    <Button
                        type="primary"
                        onClick={() => handleSearchDateRange(selectedKeys, confirm)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                            width: 100,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
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
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    });

    const buttonReloadTable = () => {
        return (
            <div style={{display: "flex", justifyContent: "center"}}>
                <ReloadOutlined style={{color: '#1677ff', fontSize: '18px', cursor: 'pointer'}} onClick={handleResetAllFilter}/>
            </div>
        )
    }

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
            key: 'soDen',
            sorter: (a, b) => a.soDen - b.soDen,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('soDen', 'số đến')
        },
        {
            title: 'Ngày đến',
            dataIndex: 'ngayDen',
            key: 'ngayDen',
            sorter: (a, b) => new Date(a.ngayDen.props.children) - new Date(b.ngayDen.props.children),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            // ...getColumnSearchProps('ngayDen', 'ngày đến'),
            ...getDateRangeFilterProps('ngayDen', 'ngày đến')
        },
        {
            title: 'Số VB',
            dataIndex: 'soVanBan',
            key: 'soVanBan',
            sorter: (a, b) => a.soVanBan - b.soVanBan,
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('soVanBan', 'số văn bản')
        },
        {
            title: 'Ngày đơn',
            dataIndex: 'ngayDon',
            key: 'ngayDon',
            sorter: (a, b) => new Date(a.ngayDon.props.children) - new Date(b.ngayDon.props.children),
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('ngayDon', 'ngày đơn')
        },
        {
            title: 'Người gửi',
            dataIndex: 'nguoiGui',
            key: 'nguoiGui',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('nguoiGui', 'người gửi')
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'diaChi',
            key: 'diaChi',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('diaChi', 'địa chỉ')
        },
        {
            title: 'Trích yếu',
            dataIndex: 'trichYeu',
            key: 'trichYeu',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Lãnh đạo',
            dataIndex: 'lanhDao',
            key: 'lanhDao',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
            ...getColumnSearchProps('lanhDao', 'lãnh đạo')
        },
        {
            title: 'Chuyển 1',
            dataIndex: 'chuyen1',
            key: 'chuyen1',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Chuyển 2',
            dataIndex: 'chuyen2',
            key: 'chuyen2',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            filteredValue: null, // Loại bỏ filter mặc định
            onFilter: null, // Loại bỏ filter mặc định
        },
        {
          title: buttonReloadTable,
          dataIndex: 'action',
          render: renderAction
        },
    ];

    const handleSearch = async (selectedKeys, confirm, dataIndex) => {
        setFilters(prevFilters => {
            const updatedFilters = {
                ...prevFilters,
                [dataIndex]: selectedKeys[dataIndex]
            };
            return updatedFilters;
        });

        // Tiếp tục với cuộc gọi hàm getAllLetter và truyền filters vào đó.
        getAllLetter(pagination.currentPage, pagination.pageSize, filters)
        .then(response => {
            // Xử lý response...
            queryLetter.refetch();
        })
        .catch(error => {
            message.error(error);
        });
        confirm();
    }; 

    const handleSearchDateRange = async (selectedKeys, confirm) => {
        if (selectedKeys[0] && selectedKeys[1]) {
            const fromDate = moment(new Date(selectedKeys[0])).format('DD/MM/YYYY');
            const toDate = moment(new Date(selectedKeys[1])).format('DD/MM/YYYY');
        
            setFilters(prevFilters => {
                const updatedFilters = {
                    ...prevFilters,
                    ["tuNgay"]: fromDate,
                    ["denNgay"]: toDate
                };
                return updatedFilters;
            });
    
            // Tiếp tục với cuộc gọi hàm getAllLetter và truyền filters vào đó.
            getAllLetter(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response...
                queryLetter.refetch();
            })
            .catch(error => {
                message.error(error);
            });
        }
        else {
            message.warning("Vui lòng nhập đầy đủ khoảng thời gian");
        }
        confirm();
    };
    
    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        
        if (dataIndex === "ngayDen") {
            setTuNgayMoment("");
            setDenNgayMoment("");

            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                delete updatedColumnFilters["tuNgay"];
                delete updatedColumnFilters["denNgay"];
                return updatedColumnFilters;
            });

            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters["tuNgay"];
                delete updatedFilters["denNgay"];
                return updatedFilters;
            });
        }
        else {
            setColumnFilters(prevColumnFilters => {
                const updatedColumnFilters = { ...prevColumnFilters };
                delete updatedColumnFilters[dataIndex];
                return updatedColumnFilters;
            });
            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                delete updatedFilters[dataIndex];
                return updatedFilters;
            });
        }

        // Tiếp tục với cuộc gọi hàm getAllLetter và truyền filters vào đó để xóa filter cụ thể trên server.
        getAllLetter(pagination.currentPage, pagination.pageSize, filters)
            .then(response => {
                // Xử lý response nếu cần
                queryLetter.refetch();
            })
            .catch(error => {
                // Xử lý lỗi nếu có
                message.error(error);
            });
        confirm();
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({
            ...pagination,
            currentPage: page,
            pageSize: pageSize
        });
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    }

    const handleKeyPress = (e) => {
        // Cho phép các phím số, phím mũi tên lên, xuống, và phím xóa
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown', 'Backspace'];
    
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleUpload = (file) => {
        setUploadedFiles(prevFiles => [...prevFiles, file]);
    };

    const handlePreview = (fileUrl) => {
        setPreviewFileUrl(fileUrl);
        setPreviewModalOpen(true);
    };

    const handleCancelPreview = () => {
        setPreviewModalOpen(false);
    };

    const handleRemoveFile = (index) => {
        const newUploadedFiles = [...uploadedFiles];
        newUploadedFiles.splice(index, 1);
        setUploadedFiles(newUploadedFiles);
        setStateLetter(prevState => ({
            ...prevState,
            uploadedFiles: newUploadedFiles
        }));
    };

    const props = {
        beforeUpload: (file) => {
            if (file.type !== 'application/pdf') {
                message.error(`${file.name} is not a PDF file`);
                return false;
            }
            handleUpload(file);
            return false;
        },
        showUploadList: false,
    };

    const handleFileChange = () => {
        setStateLetter((prevState) => ({
            ...prevState,
            uploadedFiles: uploadedFiles
        }));
    };
    
    // Đóng DrawerComponent
    const handleCloseDrawer = () => {
        fetchGetDetailLetter(rowSelected);
        setIsOpenDrawer(false);
    };
    
    // Hàm xử lý sự kiện khi ấn vào biểu tượng EyeOutlined
    const handlePreviewFileDetail = (file) => {
        // Kiểm tra xem file có đường dẫn hay không
        if (file.path) {
            // Nếu có đường dẫn, sử dụng đường dẫn từ server
            const fileUrl = `${process.env.REACT_APP_SERVER_URL}/${file.path}`;
            setPreviewFileUrlDetail(fileUrl);
        } else { 
            // Nếu không có đường dẫn, tạo URL từ đối tượng file
            const fileUrl = URL.createObjectURL(file);
            setPreviewFileUrlDetail(fileUrl);
        }
        // Mở modal xem trước
        setPreviewModalDetailOpen(true);
    };

    // Hàm xử lý sự kiện khi đóng modal xem trước
    const handleCancelPreviewDetail = () => {
        // Đặt URL trong state về trống để đóng modal
        setPreviewFileUrlDetail('');
        setPreviewModalDetailOpen(false);
    };

    const handleExportExcel = async () => {
        const response = await letterService.getAllLetter(0, 0, filters);

        const columns = ['Số đến', 'Ngày đến', 'Số VB', 'Ngày Đơn', 'Người gửi', "Địa chỉ", "Lãnh đạo", "Nội dung trích yếu", "Chuyển 1", "Chuyển 2", "Ghi chú"];
        const data = response.letters;
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        const fromDate = tuNgayMoment ? moment(new Date(tuNgayMoment.startOf('day'))).format("DD/MM/YYYY") : "....."
        const toDate = denNgayMoment ? moment(new Date(denNgayMoment.startOf('day'))).format("DD/MM/YYYY") : "....."

        // Add headers
        const headerRow1 = worksheet.addRow(['THEO DÕI ĐƠN CÔNG DÂN']);
        const headerRow2 = worksheet.addRow([`(Từ ngày ${fromDate} đến ${toDate})`]);
        const headerRow = worksheet.addRow(columns);
    
        // Style header rows
        [headerRow1, headerRow2, headerRow].forEach(row => {
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'center' };
                cell.font = { bold: true, size: 14, name: 'Times New Roman' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
    
        // Add data
        data.forEach(item => {
            const row = worksheet.addRow([
                item.soDen || '',
                item.ngayDen ? moment(item.ngayDen).format("DD/MM/YYYY") : '',
                item.soVanBan || '',
                item.ngayDon ? moment(item.ngayDon).format("DD/MM/YYYY") : '',
                item.nguoiGui || '',
                item.diaChi || '',
                item.lanhDao || '',
                item.trichYeu || '',
                item.chuyen1 || '',
                item.chuyen2 || '',
                item.ghiChu || ''
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.font = { size: 14, name: 'Times New Roman' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });
    
        // Merge cells
        worksheet.mergeCells('A1:K1');
        worksheet.mergeCells('A2:K2');
    
        // Set column widths
        worksheet.columns.forEach((column, index) => {
            column.width = columnWidths[index].wch;
        });
    
        // Generate buffer
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Đơn Công Dân.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
    
    const columnWidths = [
        { wch: 10 }, // Độ rộng cột số đến
        { wch: 15 }, // Độ rộng cột ngày đến
        { wch: 10 }, // Độ rộng cột số vb
        { wch: 15 }, // Độ rộng cột ngày đơn
        { wch: 20 }, // Độ rộng cột người gửi
        { wch: 30 }, // Độ rộng cột địa chỉ
        { wch: 20 }, // Độ rộng cột nội dung trích yếu
        { wch: 30 }, // Độ rộng cột lãnh đạo
        { wch: 15 }, // Độ rộng cột chuyển 1
        { wch: 15 }, // Độ rộng cột chuyển 2
        { wch: 20 }  // Độ rộng cột ghi chú
    ];

    const handleDownload = async (file) => {
        const response = await letterService.getFile(file._id);

        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${file.name}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    return (
        <div>
            <WrapperHeader>Quản lý đơn thư</WrapperHeader>
            <div style={{display: "flex", gap: "20px", marginTop: "10px" }}>
                <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}} onClick={() => setIsModalOpen(true)}>
                    <div>Thêm</div>
                    <PlusOutlined style={{fontSize: "40px", color: "#1677ff"}} />
                </Button>
                <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}} onClick={handleExportExcel}>
                    <div>Xuất Excel</div>
                    <FileExcelOutlined style={{fontSize: "40px", color: "#1677ff"}}/>
                </Button>
                {/* <Button style={{height: "90px", width: "90px", borderRadius: "6px", borderStyle: "dashed"}} onClick={handleExportPDF}>
                    <div>Xuất PDF</div>
                    <FilePdfOutlined style={{fontSize: "40px", color: "#1677ff"}}/>
                </Button> */}
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableComponent handleDeleteMultiple={handleDeleteMultipleLetters} columns={columns} data={dataTable} isLoading={isLoadingLetter || isLoadingResetFilter} resetSelection={resetSelection}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: pagination.pageSize,
                        total: letters?.totalRecord,
                        onChange: handlePageChange,
                        showSizeChanger: false
                    }}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                if (record._id) {
                                    setRowSelected(record._id);
                                }
                            },
                        };
                    }}
                />
            </div>
            <ModalComponent form={modalForm} forceRender width={1200} title="Tạo đơn thư" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
                                    <InputComponent type="number" name="soDen" value={stateLetter.soDen} onChange={(e) => handleOnChange('soDen', e.target.value)} min="1" onKeyDown={handleKeyPress}/>
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
                                    <InputComponent type="number" name="soVanBan" value={stateLetter.soVanBan} onChange={(e) => handleOnChange('soVanBan', e.target.value)} min="1" onKeyDown={handleKeyPress}/>
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
                                    <InputComponent name="trichYeu" value={stateLetter.trichYeu} onChange={(e) => handleOnChange('trichYeu', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Đính kèm file"
                                    
                                    labelCol={{ span: 4 }}
                                >   
                                    <>
                                        <Upload onChange={handleFileChange} fileList={uploadedFiles} {...props}>
                                            <Button icon={<UploadOutlined />}>Upload pdf file</Button>
                                        </Upload>
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} style={{display: "flex", alignItems: "center"}}>
                                                {file.name}
                                                <EyeOutlined style={{ fontSize: '20px', marginLeft: "10px", color: "#1677ff" }} onClick={() => handlePreview(URL.createObjectURL(file))}/>
                                                <DeleteOutlined style={{ fontSize: '18px', marginLeft: "10px", color: "red" }} onClick={() => handleRemoveFile(index)} />
                                            </div>
                                        ))}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>
                        <ModalComponent
                            title="Preview PDF"
                            open={previewModalOpen}
                            onCancel={handleCancelPreview}
                            footer={null}
                            width={800}
                        >
                            <iframe title='Preview PDF' src={previewFileUrl} width="100%" height="500px" frameBorder="0" />
                        </ModalComponent>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item wrapperCol={{ offset: 21, span: 24 }}>
                                    <Button type="primary" htmlType="submit">Tạo đơn thư</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent form={drawerForm} title="Chi tiết đơn thư" isOpen={isOpenDrawer} onClose={handleCloseDrawer} width="60%">
                <Loading isLoading = {isLoadingUpdate}>
                    <Form
                        name="drawerForm"
                        labelCol={{ span: 13 }}
                        wrapperCol={{ span: 20 }}
                        style={{ maxWidth: 1500 }}
                        initialValues={{ remember: true }}
                        onFinish={onUpdateLetter}
                        autoComplete="on"
                        form={drawerForm}
                    >
                        <Row gutter={[16, 16]}> {/* Tạo hàng mới với khoảng cách giữa các cột */}
                            <Col span={8}> {/* Cột đầu tiên */}
                                <Form.Item
                                    label="Số đến"
                                    name="soDen"
                                    rules={[{ required: true, message: 'Vui lòng nhập số đến!' }]}
                                >
                                    <InputComponent type="number" name="soDen" value={stateLetterDetail.soDen} onChange={(e) => handleOnChangeDetail('soDen', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}> {/* Cột thứ hai */}
                                <Form.Item
                                    label="Ngày đến"
                                    // name="ngayDen"
                                    rules={[{ required: true, message: 'Vui lòng nhập ngày đến!' }]}
                                >
                                    <DatePicker 
                                        locale={viVN}
                                        format="DD/MM/YYYY"
                                        name="ngayDen" 
                                        value={moment(stateLetterDetail.ngayDen)} 
                                        style={{ width: '100%' }} 
                                        onChange={(date) => handleOnChangeDetail('ngayDen', date)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}> {/* Cột thứ ba */}
                                <Form.Item
                                    label="Số văn bản"
                                    name="soVanBan"
                                >
                                    <InputComponent type="number" name="soVanBan" value={stateLetterDetail.soVanBan} onChange={(e) => handleOnChangeDetail('soVanBan', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}> {/* Hàng mới */}
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày đơn"
                                    // name="ngayDon"
                                    rules={[{ required: true, message: 'Vui lòng nhập ngày đơn!' }]}
                                >
                                    <DatePicker 
                                        locale={viVN} 
                                        format="DD/MM/YYYY"
                                        name="ngayDon" 
                                        value={moment(stateLetterDetail.ngayDon)} 
                                        style={{ width: '100%' }} 
                                        onChange={(date) => handleOnChangeDetail('ngayDon', date)} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Người gửi"
                                    name="nguoiGui"
                                    rules={[{ required: true, message: 'Vui lòng nhập người gửi!' }]}
                                >
                                    <InputComponent name="nguoiGui" value={stateLetterDetail.nguoiGui} onChange={(e) => handleOnChangeDetail('nguoiGui', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name="diaChi"
                                    rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
                                >
                                    <InputComponent name="diaChi" value={stateLetterDetail.diaChi} onChange={(e) => handleOnChangeDetail('diaChi', e.target.value)} />
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
                                    <InputComponent name="lanhDao" value={stateLetterDetail.lanhDao} onChange={(e) => handleOnChangeDetail('lanhDao', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Chuyển 1"
                                    name="chuyen1"
                                >
                                    <InputComponent name="chuyen1" value={stateLetterDetail.chuyen1} onChange={(e) => handleOnChangeDetail('chuyen1', e.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Chuyển 2"
                                    name="chuyen2"
                                >
                                    <InputComponent name="chuyen2" value={stateLetterDetail.chuyen2} onChange={(e) => handleOnChangeDetail('chuyen2', e.target.value)} />
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
                                    <InputComponent name="ghiChu" value={stateLetterDetail.ghiChu} onChange={(e) => handleOnChangeDetail('ghiChu', e.target.value)} />
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
                                    <InputComponent name="trichYeu" value={stateLetterDetail.trichYeu}  onChange={(e) => handleOnChangeDetail('trichYeu', e.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Đính kèm file"
                                    labelCol={{ span: 4 }}
                                >
                                    <>
                                        {stateLetterDetail.uploadedFiles.map((file, index) => (
                                            <div key={index} style={{display: "flex", alignItems: "center"}}>
                                                {file.name}
                                                <DownloadOutlined
                                                    style={{ fontSize: '18px', marginLeft: '10px', color: 'green' }} 
                                                    onClick={() => handleDownload(file)}
                                                />
                                            </div>
                                        ))}
                                    </>
                                </Form.Item>
                            </Col>
                        </Row>
                        <ModalComponent
                            title="Preview PDF Detail"
                            open={previewModalDetailOpen}
                            onCancel={handleCancelPreviewDetail}
                            footer={null}
                            width={800}
                        >
                            <iframe title='Preview PDF Detail' src={previewFileUrlDetail} width="100%" height="500px" frameBorder="0" />
                        </ModalComponent>
                        <Form.Item wrapperCol={{ offset: 20, span: 24 }}>
                            <Button type="primary" htmlType="submit">Cập nhật đơn thư</Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent width={400} title="Xóa sản phẩm" open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteLetter}>
                <Loading isLoading={isLoadingDeleted}>
                    <div>Bạn có muốn xóa đơn thư này không?</div>
                </Loading>
            </ModalComponent>
        </div>
    )
}
