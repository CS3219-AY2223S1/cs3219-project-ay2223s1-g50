import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const MyAccordion = (props) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        {props.accordionTitle}
      </AccordionSummary>
      <AccordionDetails>{props.accordionDetails}</AccordionDetails>
    </Accordion>
  )
}

export default MyAccordion
