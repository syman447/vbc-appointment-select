import React from "react";
import axios from "axios";
import { Dropdown, Form } from "semantic-ui-react";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ageGroup: null,
      sessionTypes: [],
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

    console.log("hi");
  }

  componentDidMount() {
    console.log("hello");

    axios.get("https://www.virtualbabysittersclub.com/api/v2/calendars").then(response => this.setState({
      performerOptions: response.data.map(option => ({
        key: option.id,
        text: option.name,
        value: option.id,
      })),
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
      </Form>
    );
  }
}

export default App;
