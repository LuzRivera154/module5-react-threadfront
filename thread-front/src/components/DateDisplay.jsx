export function DateDisplay({ date, className = `` }) {
  if (!date) return null;

  const dateObj = new Date(date);

  const heureOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23' 
  };

  const dateOptions = {
    day: '2-digit',
    month: 'long',
    year: '2-digit' 
  };

  const heureFormatee = new Intl.DateTimeFormat('fr-FR', heureOptions).format(dateObj);
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', dateOptions).format(dateObj);


  const resultat = `${heureFormatee} - ${dateFormatee}`;

  return (
    <span className="date-display">
      {resultat}
    </span>
  );
}