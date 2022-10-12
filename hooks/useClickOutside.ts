import { useEffect } from "react";

type Props = {
  ref: React.RefObject<any>;
  handler: (event: MouseEvent | TouchEvent) => void;
};
const useClickOutside = ({ ref, handler }: Props) => {
  console.log(ref);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
};

export default useClickOutside;
