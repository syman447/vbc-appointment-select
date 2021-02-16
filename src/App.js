import React from "react";
import axios from "axios";
import { Card, Dropdown, Form, Header, Button, Image } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import momentTimeZone from 'moment-timezone';
import moment from "moment";
import _ from "lodash";
import Iframe from 'react-iframe'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ageGroup: null,
      sessionTypes: [],
      month: new Date(),
      spots: 1,
      timezone: momentTimeZone.tz.guess(),
      daysOfWeek: [],
      timesOfDay: [],
      performers: [],
      sessionTypeOptions: [
        "#Dance",
        "Breakout Adventures",
        "Beat The Board",
        "Creation Station",
        "Creative Movement Ballet Studio",
        "Dance Party",
        "Melodies and Art",
        "Music Studio",
        "Princess Dance Party",
        "Puppet Playground",
        "Smarty Pants",
      ].map(option => ({
        key: option,
        text: option,
        value: option,
      })),
      performerOptions: [],
      appointmentOptions: [],
      chosenAppointment: "",
    }
  }

  componentDidMount() {
    this.getPerformerOptions();
    this.getAppointmentOptions();
  }

  componentDidUpdate(prevProps, prevState) {
    const { timezone, month } = this.state;

    const monthMoment = moment(month);
    const previousMonthMoment = moment(prevState.month);

    if (timezone !== prevState.timezone || !monthMoment.isSame(previousMonthMoment)) {
      this.getAppointmentOptions();
    }
  }

  getPerformerOptions = () => {
    axios.get("https://www.virtualbabysittersclub.com/api/v2/calendars").then(response => this.setState({
      performerOptions: response.data.map(option => ({
        key: option.id,
        text: option.name,
        value: option.id,
      })),
    }));
  }

  getAppointmentOptions = () => {
    const { timezone, month } = this.state;

    const monthMoment = moment(month);
    axios.get(`https://www.virtualbabysittersclub.com/api/v2/classes?month=${monthMoment.format("YYYY-MM")}&timezone=${timezone}`)
      .then(response => this.setState({
        appointmentOptions: _.groupBy(response.data.sort((a, b) => moment(a.time).diff(moment(b.time))), function(appointment) {
            return moment(appointment.time).format("dddd, MMMM D, YYYY");
        }),
      }));
  }

  render() {
    const {
      ageGroup,
      sessionTypeOptions,
      sessionTypes,
      performerOptions,
      performers,
      spots,
      month,
      daysOfWeek,
      timesOfDay,
      timezone,
      appointmentOptions,
      chosenAppointment,
    } = this.state;

    if (chosenAppointment) {
      return (
        <Iframe
          url={chosenAppointment}
          width="100%"
          height="800px"
        />
      );
    }

    return (
      <>
        <Form>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Age Group</label>
              <Dropdown
                placeholder="All Ages"
                selection
                clearable
                selectOnBlur={false}
                selectOnNavigation={false}
                options={[
                  {
                    key: "3-6",
                    text: "Ages 3-6",
                    value: "3-6",
                  },
                  {
                    key: "7-12",
                    text: "Ages 7-12",
                    value: "7-12",
                  },
                ]}
                onChange={(event, data) => this.setState({ ageGroup: data.value })}
                value={ageGroup}
              />
            </Form.Field>
            <Form.Field>
              <label>Session Type</label>
              <Dropdown
                placeholder="All Session Types"
                selection
                multiple
                search
                options={sessionTypeOptions}
                onChange={(event, data) => this.setState({ sessionTypes: data.value })}
                value={sessionTypes}
              />
            </Form.Field>
            <Form.Field>
              <label>Performer</label>
              <Dropdown
                placeholder="All Performers"
                selection
                multiple
                options={performerOptions}
                onChange={(event, data) => this.setState({ performers: data.value })}
                value={performers}
              />
            </Form.Field>
            <Form.Field>
              <label>Spots</label>
              <input
                type='number'
                value={spots}
                onChange={(event) => this.setState({ spots: event.target.valueAsNumber })}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field className="customDatePickerWidth">
              <label>Month</label>
              <DatePicker
                selected={month}
                onChange={date => this.setState({ month: date })}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                popperPlacement="bottom-center"
              />
            </Form.Field>
            <Form.Field>
              <label>Day of Week</label>
              <Dropdown
                placeholder="All Days"
                selection
                multiple
                options={[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map(option => ({
                  key: option,
                  text: option,
                  value: option,
                }))}
                onChange={(event, data) => this.setState({ daysOfWeek: data.value })}
                value={daysOfWeek}
              />
            </Form.Field>
            <Form.Field>
              <label>Time of Day</label>
              <Dropdown
                placeholder="All Times"
                selection
                multiple
                options={[
                  "Morning",
                  "Afternoon",
                  "Evening",
                ].map(option => ({
                  key: option,
                  text: option,
                  value: option,
                }))}
                onChange={(event, data) => this.setState({ timesOfDay: data.value })}
                value={timesOfDay}
              />
            </Form.Field>
            <Form.Field>
              <label>Time Zone</label>
              <Dropdown
                selection
                options={momentTimeZone.tz.names().map(option => ({
                  key: option,
                  text: `(GMT${moment().tz(option).format("Z")}) ${option}`,
                  value: option,
                }))}
                onChange={(event, data) => this.setState({ timezone: data.value })}
                value={timezone}
              />
            </Form.Field>
          </Form.Group>
        </Form>
        {Object.keys(appointmentOptions).map(day => (
          <>
            <Header content={day} />
            {appointmentOptions[day].map(appointment => {
              const duration = moment.utc().startOf('day').add({ minutes: appointment.duration });
              const durationHours = duration.hours();
              const durationMinutes = duration.minutes();

              return (
                <Card.Group fluid>
                  <Card fluid>
                    <Card.Content>
                      <Image size="small" floated="right" src={appointment.image} />
                      <Card.Header>{appointment.name}</Card.Header>
                      <Card.Meta>
                        <span>{moment(appointment.time).format("h:mm A,  dddd, MMMM D, YYYY")}</span><br/>
                        <span>{durationHours > 0 ? `${durationHours} Hour${durationHours > 1 ? "s" : ""} ` : ""}{durationMinutes > 0 ? `${durationMinutes} Minute${durationMinutes > 1 ? "s" : ""} ` : ""}</span>
                      </Card.Meta>
                      <Card.Description>
                        {appointment.description}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <Button
                        color="blue"
                        onClick={() => this.setState({ chosenAppointment: `${appointment.schedulingUrl}?datetime=${appointment.time}&appointmentType=${appointment.appointmentTypeID}&quantity=${spots}` })}
                      >
                        Sign Up
                      </Button>
                      <span style={{ marginLeft: "0.5em" }}>{appointment.slotsAvailable} Spots Left</span>
                    </Card.Content>
                  </Card>
                </Card.Group>
              );
            })}
          </>
        ))}
      </>
    );
  }
}

export default App;
