import { useState, useEffect, useRef, useCallback } from 'react';

export function useMenuBarState() {
    const [activeMenu, setActiveMenu] = useState(null);
    const menuRef = useRef(null);

    const handleMenuClick = useCallback((menuName) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    }, [activeMenu]);

    const handleMenuItemClick = useCallback((action) => {
        setActiveMenu(null);
        return action;
    }, []);

    const closeMenu = useCallback(() => {
        setActiveMenu(null);
    }, []);

    // 메뉴 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return {
        activeMenu,
        menuRef,
        handleMenuClick,
        handleMenuItemClick,
        closeMenu
    };
} 