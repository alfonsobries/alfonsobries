import Container from "./container";
import Image from "next/future/image";
import imageThisGuy from "../public/images/this-guy.svg";

const Footer = () => {
  return (
    <footer className="text-xs text-gray-600 ">
      <Container>
        <div className="text-center flex flex-col space-y-2 items-center border-t mt-8 pt-8 border-gray-100 dark:border-gray-800">
          <span>Idea, illustrations, design and development by</span>
          <span>
            <Image src={imageThisGuy} alt="Alfonso Bribiesca" width={50} />
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
