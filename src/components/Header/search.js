const Header = ({ user }) => {
    const { showProfile, handleProfileModal,
        showDropdownMenu, handleDropdownMenu,
        isActive, setIsActive, setShowChannelForm,
        setShowDMForm, setShowProfile,
        setShowDropdownMenu, setShowCreateModal,
        showSearch, handleSearchModal, setShowSearch
    } = useConsumeContext();

    const [channels, setChannels] = useState([]);
    const [channelSearchInput, setChannelSearchInput] = useState("");
    const dispatch = useDispatch();
    const userChannels = useSelector(state => Object.values(state.channels));

    const handleProfileDropdown = () => {
        handleProfileModal();
        handleDropdownMenu();
    }

    const onLogout = async (e) => { // close all the modals
        dispatch(logout());
        handleDropdownMenu();
        setShowChannelForm(false);
        setShowDMForm(false);
        setShowProfile(false);
        setShowDropdownMenu(false);
        setShowCreateModal(false);
        setShowSearch(false);
    };

    const handleChannelSearch = (e) => {
        if (e.target.value === "") {
            setChannels([]);
            setChannelSearchInput("");
        }

        if (e.target.value.length > 0) {

            let filteredResults = userChannels.filter(channel => {
                if (channel.channel_type === "dm") {
                    let usernames = Object.values(channel.users).map(u => u.name.toLowerCase());
                    usernames = usernames.filter(name => name !== `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()}`);

                    for (let username of usernames) {

                        if (username.includes(e.target.value.toLowerCase())) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return channel['name']?.toLowerCase().includes(e.target.value.toLowerCase())
                }
            });
            setChannelSearchInput(e.target.value);
            setChannels(filteredResults);
        }

    }

    return (
        <div className="header">
            <div className="header__left">
                {/* <TimeIcon id="time__icon"/> */}
            </div>
            {!showSearch &&
                <div className="header__search" onClick={handleSearchModal}>
                    <div id="search__icon">
                        <SearchIcon />
                    </div>
                    <p>Search SlackX</p>
                </div>
            }
            {showSearch &&
                <input className="header__search" placeholder="Search for channels or users" value={channelSearchInput} onChange={handleChannelSearch}/>
            }
            {showSearch && <SearchModal channels={channels} setChannelSearchInput={setChannelSearchInput} setChannels={setChannels}/>}
            
            </div>
        )
    }