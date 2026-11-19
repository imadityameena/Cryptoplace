import { useEffect } from "react";

const APP_NAME = "Cryptoplace";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
};

export default usePageTitle;
