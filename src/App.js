import React from "react";
import axios from "axios";
import { Dropdown, Form } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import momentTimeZone from 'moment-timezone';
import moment from "moment";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ageGroup: null,
      sessionTypes: [],
      month: new Date(),
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
        appointmentOptions: response.data,
      }));
  }

  render() {
    return (
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
              value={this.state.ageGroup}
            />
          </Form.Field>
          <Form.Field>
            <label>Session Type</label>
            <Dropdown
              placeholder="All Session Types"
              selection
              multiple
              search
              options={this.state.sessionTypeOptions}
              onChange={(event, data) => this.setState({ sessionTypes: data.value })}
              value={this.state.sessionTypes}
            />
          </Form.Field>
          <Form.Field>
            <label>Performer</label>
            <Dropdown
              placeholder="All Performers"
              selection
              multiple
              options={this.state.performerOptions}
              onChange={(event, data) => this.setState({ performers: data.value })}
              value={this.state.performers}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field className="customDatePickerWidth">
            <label>Month</label>
            <DatePicker
              selected={this.state.month}
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
              value={this.state.daysOfWeek}
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
              value={this.state.timesOfDay}
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
              value={this.state.timezone}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    );
  }
}

export default App;
