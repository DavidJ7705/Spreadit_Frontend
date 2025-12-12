import { createContext, useState, useEffect, useCallback } from 'react'

const GlobalContext = createContext()

export function GlobalContextProvider(props) {
    const [globals, setGlobals] = useState({
        aString: 'init val',
        postCount: 0,
        userId: null,
        isLoggedIn: false
    })

    // Fetch post count for current user
    const fetchPostCount = useCallback(async (userId) => {
        if (!userId) return;

        try {
            const res = await fetch("http://localhost:8000/getPostCount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                const data = await res.json();
                setGlobals(prev => ({ ...prev, postCount: data.count }));
            }
        } catch (err) {
            console.error("Error fetching post count:", err);
        }
    }, []);

    // Refresh post count (call after creating/deleting posts)
    const refreshPostCount = useCallback(() => {
        if (globals.userId) {
            fetchPostCount(globals.userId);
        }
    }, [globals.userId, fetchPostCount]);

    function editGlobalData(command) {
        console.log('editGlobalData ' + JSON.stringify(command))

        if (command.cmd === 'setUser') {
            setGlobals(prev => ({
                ...prev,
                userId: command.userId,
                isLoggedIn: !!command.userId
            }));
            if (command.userId) {
                fetchPostCount(command.userId);
            }
        }

        if (command.cmd === 'logout') {
            setGlobals(prev => ({
                ...prev,
                userId: null,
                isLoggedIn: false,
                postCount: 0
            }));
        }

        if (command.cmd === 'changeTheString') {
            setGlobals(prev => ({ ...prev, aString: command.newVal }));
        }

        if (command.cmd === 'incPostCount') {
            setGlobals(prev => ({ ...prev, postCount: prev.postCount + 1 }));
        }

        if (command.cmd === 'decPostCount') {
            setGlobals(prev => ({ ...prev, postCount: Math.max(0, prev.postCount - 1) }));
        }

        if (command.cmd === 'setPostCount') {
            setGlobals(prev => ({ ...prev, postCount: command.count }));
        }

        console.log('globals ' + JSON.stringify(globals))
    }

    const context = {
        updateGlobals: editGlobalData,
        theGlobalObject: globals,
        refreshPostCount
    }

    return <GlobalContext.Provider value={context}>
        {props.children}
    </GlobalContext.Provider>
}

export default GlobalContext
