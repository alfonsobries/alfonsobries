import { useRouter } from "next/router";

const useIsHome = () => {
  const router = useRouter();

  return router.pathname === "/";
};

export default useIsHome;
