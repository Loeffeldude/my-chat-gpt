import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChatSelection } from "./components/ChatSelection";
import { useAppDispatch, useAppSelector } from "./lib/hooks/redux";
import { useEffect, useState } from "react";
import { FiSettings, FiX, FiMenu } from "react-icons/fi";
import classNames from "classnames";
import { IconButton } from "./components/IconButton";
import { createChat, switchChat } from "./features/chat";

function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const classes = classNames(
    {
      "translate-x-0": isOpen,
      "-translate-x-full ": !isOpen,
    },
    "fixed left-0 top-0 bottom-0 w-72 transition-transform z-20 border-r-2 border-mirage-700  bg-mirage-800"
  );

  return (
    <>
      <div className="fixed top-0 left-0 z-50 p-2">
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          className=" p-2"
          aria-label={`${isOpen ? "Close" : "Open"} side menu`}
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </IconButton>
      </div>
      <aside className={classes}>
        <div className="flex h-full flex-col px-2 pt-14">
          <div className="flex-1 basis-full overflow-y-auto">
            <ChatSelection />
          </div>
          <div className="mx-2 flex-1 py-4">
            <Link to={"/settings"} aria-label="Settings">
              <FiSettings size={20} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const state = useAppSelector((state) => state);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!state.chats.activeId) {
      const firstChat = Object.values(state.chats.chats)[0];

      if (!firstChat) {
        dispatch(createChat({ preamble: state.settings.preamble }));
      } else {
        dispatch(switchChat({ id: firstChat.id }));
      }
      return;
    }

    if (!location.pathname.includes(state.chats.activeId)) {
      navigate(`/${state.chats.activeId}`);
    }
  }, [
    dispatch,
    location.pathname,
    navigate,
    state.chats.activeId,
    state.chats.chats,
    state.settings.preamble,
  ]);

  return (
    <div className="app">
      <SideMenu />
      <main className="overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export { App };
