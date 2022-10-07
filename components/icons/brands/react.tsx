import classNames from "classnames";

type Props = {
  className?: string;
};

// #61dafb
const React = ({ className }: Props) => {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={classNames(className)}
    >
      <path
        fill="currentColor"
        d="M16 13.148c-1.575 0-2.852 1.277-2.852 2.852s1.277 2.852 2.852 2.852v0c1.575 0 2.852-1.277 2.852-2.852s-1.277-2.852-2.852-2.852v0zM8.011 21.673l-0.629-0.16c-4.691-1.185-7.381-3.197-7.381-5.519s2.691-4.333 7.381-5.519l0.629-0.159 0.177 0.624c0.545 1.86 1.163 3.443 1.899 4.957l-0.082-0.186 0.135 0.284-0.135 0.284c-0.656 1.329-1.275 2.912-1.761 4.551l-0.056 0.22zM7.089 11.933c-3.565 1.001-5.753 2.533-5.753 4.061 0 1.527 2.188 3.059 5.753 4.061 0.512-1.62 1.046-2.965 1.662-4.263l-0.086 0.202c-0.531-1.098-1.066-2.443-1.511-3.828l-0.065-0.234zM23.989 21.673l-0.177-0.625c-0.544-1.859-1.162-3.441-1.9-4.954l0.081 0.184-0.135-0.284 0.135-0.284c0.656-1.329 1.275-2.911 1.762-4.55l0.056-0.221 0.177-0.624 0.631 0.159c4.689 1.185 7.38 3.197 7.38 5.52s-2.691 4.333-7.38 5.519zM23.335 15.995c0.64 1.385 1.169 2.747 1.576 4.061 3.567-1.003 5.753-2.535 5.753-4.061 0-1.528-2.188-3.059-5.753-4.061-0.511 1.619-1.045 2.963-1.662 4.262l0.086-0.2zM7.080 11.927l-0.177-0.623c-1.319-4.648-0.919-7.979 1.097-9.141 1.977-1.141 5.152 0.207 8.479 3.621l0.453 0.465-0.453 0.465c-1.146 1.19-2.207 2.482-3.162 3.853l-0.068 0.103-0.18 0.257-0.313 0.027c-1.875 0.151-3.596 0.439-5.264 0.86l0.218-0.047zM9.608 3.087c-0.357 0-0.673 0.077-0.94 0.231-1.325 0.764-1.56 3.42-0.647 7.004 1.21-0.285 2.681-0.521 4.18-0.658l0.131-0.010c0.894-1.264 1.792-2.37 2.756-3.414l-0.020 0.022c-2.080-2.025-4.049-3.175-5.46-3.175zM22.393 30.236c-0.001 0-0.001 0 0 0-1.9 0-4.34-1.431-6.872-4.031l-0.453-0.465 0.453-0.465c1.146-1.19 2.206-2.482 3.16-3.854l0.068-0.103 0.18-0.257 0.312-0.027c1.875-0.15 3.597-0.438 5.267-0.858l-0.218 0.046 0.629-0.159 0.179 0.624c1.316 4.645 0.917 7.977-1.099 9.139-0.449 0.259-0.988 0.411-1.562 0.411-0.016 0-0.031-0-0.047-0l0.002 0zM16.932 25.728c2.080 2.025 4.049 3.175 5.46 3.175h0.001c0.356 0 0.673-0.077 0.939-0.231 1.325-0.764 1.561-3.421 0.647-7.005-1.212 0.286-2.682 0.522-4.182 0.658l-0.13 0.010c-0.893 1.265-1.791 2.371-2.755 3.416l0.020-0.022zM24.92 11.927l-0.629-0.159c-1.453-0.376-3.175-0.664-4.939-0.806l-0.111-0.007-0.312-0.027-0.18-0.257c-1.021-1.474-2.082-2.766-3.237-3.966l0.009 0.010-0.453-0.465 0.453-0.465c3.325-3.413 6.499-4.761 8.479-3.621 2.016 1.163 2.416 4.493 1.099 9.14zM19.667 9.653c1.523 0.139 2.969 0.364 4.312 0.668 0.915-3.584 0.679-6.24-0.647-7.004-1.317-0.761-3.793 0.405-6.4 2.944 0.943 1.022 1.841 2.128 2.666 3.289l0.069 0.103zM9.608 30.236c-0.014 0-0.030 0-0.046 0-0.574 0-1.113-0.152-1.577-0.419l0.015 0.008c-2.016-1.161-2.416-4.492-1.097-9.139l0.176-0.624 0.629 0.159c1.54 0.388 3.239 0.661 5.047 0.812l0.313 0.027 0.179 0.257c1.022 1.475 2.083 2.767 3.239 3.967l-0.010-0.010 0.453 0.465-0.453 0.465c-2.531 2.6-4.971 4.031-6.868 4.031zM8.021 21.667c-0.915 3.584-0.679 6.241 0.647 7.005 1.316 0.751 3.791-0.407 6.4-2.944-0.943-1.022-1.841-2.129-2.667-3.29l-0.069-0.103c-1.629-0.146-3.099-0.382-4.534-0.711l0.224 0.043zM16 22.504c-1.097 0-2.225-0.048-3.355-0.141l-0.313-0.027-0.18-0.257c-0.544-0.768-1.139-1.691-1.697-2.639l-0.103-0.19c-0.452-0.758-0.971-1.732-1.45-2.728l-0.105-0.243-0.133-0.284 0.133-0.284c0.584-1.239 1.102-2.212 1.658-3.161l-0.103 0.191c0.552-0.955 1.159-1.907 1.8-2.829l0.18-0.257 0.313-0.027c1.005-0.090 2.174-0.142 3.355-0.142s2.35 0.052 3.505 0.153l-0.15-0.011 0.312 0.027 0.179 0.257c1.177 1.666 2.294 3.567 3.252 5.56l0.104 0.24 0.135 0.284-0.135 0.284c-1.058 2.232-2.176 4.133-3.439 5.925l0.083-0.125-0.179 0.257-0.312 0.027c-1.129 0.093-2.259 0.141-3.356 0.141zM13.071 21.059c1.973 0.148 3.885 0.148 5.86 0 1.004-1.445 1.978-3.104 2.827-4.836l0.101-0.228c-0.947-1.958-1.922-3.617-3.012-5.19l0.083 0.126c-0.877-0.071-1.898-0.111-2.929-0.111s-2.052 0.040-3.063 0.119l0.134-0.008c-1.008 1.447-1.983 3.106-2.83 4.84l-0.099 0.224c0.951 1.96 1.926 3.619 3.014 5.193l-0.085-0.13z"
      ></path>
    </svg>
  );
};

export default React;
