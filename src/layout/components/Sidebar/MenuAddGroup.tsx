import Button from '../../../components/Button';
import { Wrapper } from '../../../components/Popper';
import className from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { AddGroupRequest, RelationShip, State } from '../../../type';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserService } from '../../../apiService';
import Crop from '../../../components/Crop';
import { uploadBytes, getDownloadURL, storageRef, storage } from '../../../firebase';
import { useSelector } from 'react-redux';

const cx = className.bind(styles);

interface MenuAddGroup {
    listRelationShip: RelationShip[];
    render: boolean;
    setRender: React.Dispatch<React.SetStateAction<boolean>>;
    setShowGroupAdd: React.Dispatch<React.SetStateAction<boolean>>;
}

interface RelationShipItem {
    relationShip: RelationShip;
    choose: boolean;
}

const urlDefault = 'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg';

const MenuAddGroup = ({ listRelationShip, render, setRender, setShowGroupAdd }: MenuAddGroup) => {
    const [nameGroup, setNameGroup] = useState('');
    const [urlAvatar, setUrlAvatar] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    const currentUser = useSelector<any>((state) => state.UserReducer) as State;
    const { user } = currentUser;

    const inputFile = useRef<HTMLInputElement>(null);

    const [showCrop, setShowCrop] = useState(false);

    useEffect(() => {
        setNameGroup('');
        setUrlAvatar(null);
        setListData(
            listRelationShip
                .filter((r) => !r.isGroup)
                .map((relationShip) => ({
                    relationShip,
                    choose: false,
                })),
        );
    }, [render]);

    const [listData, setListData] = useState<RelationShipItem[]>(
        listRelationShip
            .filter((r) => !r.isGroup)
            .map((relationShip) => ({
                relationShip,
                choose: false,
            })),
    );

    const showItem = useCallback(() => {
        return listData.filter(
            (item) => query === '' || item.relationShip.name.toLowerCase().includes(query.trim().toLowerCase()),
        );
    }, [listData, query]);

    const selectedItem = useCallback(() => {
        return listData.filter((item) => item.choose);
    }, [listData]);

    const handleSelectItem = (itemID: string) => {
        const newListData = listData.map((a) => {
            if (a.relationShip.id === itemID) {
                if (!a.choose) {
                    if (selectedItem().length >= 100) {
                        alert('Số người tối đa trong group đạt giới hạn!');
                        return a;
                    }
                }
                a.choose = !a.choose;
            }
            return a;
        });
        setListData(newListData);
    };

    const handleRemoveItem = (itemID: string) => {
        const newListData = listData.map((a) => {
            if (a.relationShip.id === itemID) {
                if (a.choose) {
                    a.choose = false;
                }
            }
            return a;
        });
        setListData(newListData);
    };

    const handleClickSave = async () => {
        if (urlAvatar && nameGroup && selectedItem().length > 0) {
            const url = await uploadImage(urlAvatar);
            if (url) {
                const requestAddGroup: AddGroupRequest = {
                    nameGroup: nameGroup,
                    urlAvatar: url,
                    listUserID: selectedItem().map((item) => item.relationShip.friends[0].userID),
                };
                const response = await UserService.addGroup(requestAddGroup);
                console.log(response);
            }
            setShowGroupAdd(false);
        } else {
            alert('Vui lòng cập nhật đầy đủ thông tin tên group, ảnh đại diện, bạn bè');
        }
    };

    const handleOpenFile = () => {
        inputFile?.current?.click();
    };

    useEffect(() => {
        return () => {
            urlAvatar && URL.revokeObjectURL(urlAvatar);
        };
    }, [urlAvatar]);

    const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file: File = event.target.files[0];
            setShowCrop(true);
            setUrlAvatar(URL.createObjectURL(file));
            event.target.value = '';
        }
    };

    const onCancel = () => {
        setShowCrop(false);
        setUrlAvatar(null);
    };

    const handleCropImage = (preViewUrl: string) => {
        setUrlAvatar(preViewUrl);
        setShowCrop(false);
    };

    const uploadImage = async (previewUrl: string) => {
        try {
            const ref = storageRef(storage, `UserArea/${user?.email}/group/${nameGroup}.jpeg`);
            const fileData = await fetch(previewUrl);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    return (
        <Wrapper>
            {showCrop && <Crop urlAvatar={urlAvatar} handleCropImage={handleCropImage} onCancel={onCancel} />}
            <div className={cx('group-add-wrapper')}>
                <div className={cx('group-add-header-area')}>
                    <h2>Create group</h2>
                </div>
                <div className={cx('group-add-filter-area')}>
                    <div className={cx('group-add-filter-input-area')}>
                        <div className={cx('group-add-filter-input-avatar-area')}>
                            <input
                                type="file"
                                id="image_uploads"
                                ref={inputFile}
                                style={{ display: 'none' }}
                                accept="image/png, image/jpeg"
                                onChange={(e) => onChangeFile(e)}
                            />
                            <button onClick={handleOpenFile}>
                                <img src={urlAvatar || urlDefault}></img>
                            </button>
                        </div>
                        <div className={cx('group-add-filter-input-name-area')}>
                            <input
                                value={nameGroup}
                                onChange={(e) => setNameGroup(e.target.value)}
                                placeholder={`Enter group name...`}
                            />
                            <hr />
                        </div>
                    </div>
                    <div className={cx('group-add-filter-search-area')}>
                        <div className={cx('group-add-filter-search-wrapper')}>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Enter name your friend"
                            />
                        </div>
                    </div>
                </div>
                <div className={cx('group-add-list-area')}>
                    <div className={cx('group-add-list-select')}>
                        {showItem().map((item, index) => {
                            return (
                                <div
                                    className={cx('group-add-list-select-item', { selected: item.choose })}
                                    key={index}
                                >
                                    <button onClick={() => handleSelectItem(item.relationShip.id)}>
                                        <div className={cx('group-add-list-select-item-avatar')}>
                                            <img src={item.relationShip.urlPic} alt={item.relationShip.name} />
                                        </div>
                                        <div className={cx('group-add-list-select-item-name')}>
                                            <p>{item.relationShip.name}</p>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {selectedItem().length > 0 && (
                        <div className={cx('group-add-list-added')}>
                            <div className={cx('group-add-list-added-header')}>
                                <p>Added {selectedItem().length}/100</p>
                            </div>
                            <div className={cx('group-add-list-added-data-wrapper')}>
                                {selectedItem().map((item, index) => {
                                    return (
                                        <div className={cx('group-add-list-added-data-item')} key={index}>
                                            <button onClick={() => handleRemoveItem(item.relationShip.id)}>
                                                <div className={cx('group-add-list-added-item-avatar')}>
                                                    <img src={item.relationShip.urlPic} alt={item.relationShip.name} />
                                                </div>
                                                <div className={cx('group-add-list-added-item-name')}>
                                                    <p>{item.relationShip.name}</p>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className={cx('group-add-action-area')}>
                    <div className={cx('group-add-action-cancel')}>
                        <Button primary onClick={() => setShowGroupAdd(false)}>
                            Cancel
                        </Button>
                    </div>
                    <div className={cx('group-add-action-save')}>
                        <Button primary onClick={handleClickSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};

export default MenuAddGroup;
