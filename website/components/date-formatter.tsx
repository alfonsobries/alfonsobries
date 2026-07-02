import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { LocaleCode } from "../interfaces/localization";
import capitalize from "../helpers/capitalize";
type Props = {
  dateString: string;
  locale: LocaleCode;
};

const DateFormatter = ({ dateString, locale }: Props) => {
  if (dateString === null || dateString === undefined) {
    return <span>NO DATE</span>;
  }

  const date = parseISO(dateString);
  return (
    <time dateTime={dateString}>
      {capitalize(
        format(date, "LLLL	d, yyyy", {
          locale: locale === "es" ? es : undefined,
        })
      )}
    </time>
  );
};

export default DateFormatter;
