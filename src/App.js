import React, { Fragment } from "react";
import axios from "axios";
import { Card, Dropdown, Form, Header, Button, Image, Dimmer, Loader, Segment, Container } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import momentTimeZone from 'moment-timezone';
import moment from "moment";
import _ from "lodash";
import Iframe from 'react-iframe'
import { withRouter } from 'react-router-dom';
import qs from "query-string";

const getSessionTypeFromCategory = (category) => category.split("(")[0].trim();

const getAgeGroupFromCategory = (category) => category.match(/\(([^)]+)\)/).pop();

const isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

const MonthPickerInput = ({ ...props }) => (
  <input type="text" {...props} readOnly />
);

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMES_OF_DAY = [
  "Morning",
  "Afternoon",
  "Evening",
];

class App extends React.Component {
  constructor(props) {
    super(props);

    const {
      ageGroup,
      sessionType,
      month,
      spots,
      timezone,
      dayOfWeek,
      timeOfDay,
      performer,
    } = qs.parse(props.location.search || "");

    this.state = {
      loading: false,
      ageGroups: ageGroup ? (
        Array.isArray(ageGroup) ? _.uniq(ageGroup.filter(x => x)) : [ageGroup]
      ) : [],
      sessionTypes: sessionType ? (
        Array.isArray(sessionType) ? _.uniq(sessionType.filter(x => x)) : [sessionType]
      ) : [],
      month: (month && moment(month).isValid()) ? moment(month).toDate() : new Date(),
      spots: parseInt(spots) && parseInt(spots) > 0 ? parseInt(spots) : 1,
      timezone: timezone && momentTimeZone.tz.names().includes(timezone) ? timezone : momentTimeZone.tz.guess(),
      daysOfWeek: dayOfWeek ? (
        Array.isArray(dayOfWeek) ? _.uniq(dayOfWeek.filter(x => DAYS_OF_WEEK.includes(x))) : (
          DAYS_OF_WEEK.includes(dayOfWeek) ? [dayOfWeek] : []
        )
      ) : [],
      timesOfDay: timeOfDay ? (
        Array.isArray(timeOfDay) ? _.uniq(timeOfDay.filter(x => TIMES_OF_DAY.includes(x))) : (
          TIMES_OF_DAY.includes(timeOfDay) ? [timeOfDay] : []
        )
      ) : [],
      performers: performer ? (
        Array.isArray(performer) ? _.uniq(performer.filter(x => x).map(x => x.toString())) : [performer.toString()]
      ) : [],
      ageGroupOptions: [],
      sessionTypeOptions: [],
      performerOptions: [],
      appointmentOptions: [],
      chosenAppointment: "",
      chosenAppointmentLoading: false,
      error: null,
    }

    props.history.push({ search: '' });
  }

  componentDidMount() {
    this.getPerformerOptions();
    this.getAppointmentOptions();
  }

  componentDidUpdate(prevProps, prevState) {
    const { month } = this.state;

    const monthMoment = moment(month);
    const previousMonthMoment = moment(prevState.month);

    if (monthMoment.month() !== previousMonthMoment.month() || monthMoment.year() !== previousMonthMoment.year()) {
      this.getAppointmentOptions();
    }
  }

  getPerformerOptions = () => {
    axios.get("https://www.virtualbabysittersclub.com/api/v2/calendars").then(response => this.setState(prevState => ({
      performerOptions: response.data.map(option => ({
        key: option.id.toString(),
        text: option.name,
        value: option.id.toString(),
      })),
      performers: prevState.performers.filter(performer => response.data.map(option => option.id.toString()).includes(performer)),
    })));
  }

  getAppointmentOptions = () => {
    const { month } = this.state;

    this.setState({ loading: true });

    const monthMoment = moment(month);
    axios.get(`https://www.virtualbabysittersclub.com/api/v2/classes?month=${monthMoment.format("YYYY-MM")}`)
      .then(response => this.setState(prevState => {
        const sessionTypeOptions = _.uniq(response.data.filter(option => option.category).map(option => getSessionTypeFromCategory(option.category))).sort();
        const ageGroupOptions = _.uniq(response.data.filter(option => option.category).map(option => getAgeGroupFromCategory(option.category))).sort();

        return {
          loading: false,
          appointmentOptions: _.groupBy(response.data.sort((a, b) => moment(a.time).diff(moment(b.time))), function(appointment) {
              return moment(appointment.time).format("dddd, MMMM D, YYYY");
          }),
          sessionTypeOptions: sessionTypeOptions.map(option => ({
            key: option,
            text: option,
            value: option,
          })),
          ageGroupOptions: ageGroupOptions.map(option => ({
            key: option,
            text: option,
            value: option,
          })),
          ageGroups: prevState.ageGroups.filter(ageGroup => ageGroupOptions.includes(ageGroup)),
          sessionTypes: prevState.sessionTypes.filter(sessionType => sessionTypeOptions.includes(sessionType)),
        }
      }))
      .catch(error => this.setState({
        loading: false,
        error,
      }));
  }

  renderAppointments = () => {
    const {
      ageGroups,
      sessionTypes,
      performers,
      spots,
      daysOfWeek,
      timesOfDay,
      timezone,
      appointmentOptions,
    } = this.state;

    return Object.keys(appointmentOptions).map(day => {
      const filteredAppointmentsForDay = appointmentOptions[day].filter(appointment => {
        const appointmentTime = moment(appointment.time).tz(timezone);

        return (
          (!ageGroups.length || ageGroups.includes(getAgeGroupFromCategory(appointment.category)))
          && (!sessionTypes.length || sessionTypes.includes(getSessionTypeFromCategory(appointment.category)))
          && (!performers.length || performers.includes(appointment.calendarID.toString()))
          && spots <= appointment.slotsAvailable
          && (!daysOfWeek.length || daysOfWeek.includes(appointmentTime.format("dddd")))
          && (
            !timesOfDay.length
            || (timesOfDay.includes("Morning") && appointmentTime.hour() < 12)
            || (timesOfDay.includes("Afternoon") && appointmentTime.hour() >= 12 && appointmentTime.hour() < 18)
            || (timesOfDay.includes("Evening") && appointmentTime.hour() > 18)
          )
        )
      });

      if (!filteredAppointmentsForDay.length) {
        return null;
      }

      return (
        <Fragment key={day}>
          <Header content={day} className="deferToInheritedFontFamily"/>
          {filteredAppointmentsForDay.map(appointment => {
            const duration = moment.utc().startOf('day').add({ minutes: appointment.duration });
            const durationHours = duration.hours();
            const durationMinutes = duration.minutes();

            return (
              <Card.Group key={appointment.id} style={{ margin: "0 1px" }}>
                <Card fluid>
                  <Card.Content>
                    <Image size="small" floated="right" src={appointment.image} />
                    <Card.Header className="deferToInheritedFontFamily">{`${appointment.name} (${getAgeGroupFromCategory(appointment.category)})`}</Card.Header>
                    <Card.Meta>
                      <span>{moment(appointment.time).tz(timezone).format("h:mm A,  dddd, MMMM D, YYYY")}</span><br/>
                      <span>{durationHours > 0 ? `${durationHours} Hour${durationHours > 1 ? "s" : ""} ` : ""}{durationMinutes > 0 ? `${durationMinutes} Minute${durationMinutes > 1 ? "s" : ""} ` : ""}</span>
                    </Card.Meta>
                    <Card.Description>
                      {appointment.description}
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Button
                      className="deferToInheritedFontFamily"
                      color="blue"
                      onClick={() => {
                        this.setState({
                          chosenAppointment: `${appointment.schedulingUrl}?datetime=${appointment.time}&appointmentType=${appointment.appointmentTypeID}&quantity=${spots}&timezone=${timezone}`,
                          chosenAppointmentLoading: true,
                        });
                        Array.prototype.slice.call(document.getElementsByTagName("div")).forEach(element => element.scroll({ top: 0, behavior: 'smooth' }));
                        Array.prototype.slice.call(document.getElementsByTagName("body")).forEach(element => element.scroll({ top: 0, behavior: 'smooth' }));
                        Array.prototype.slice.call(document.getElementsByTagName("html")).forEach(element => element.scroll({ top: 0, behavior: 'smooth' }));
                        window.scroll({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Sign Up
                    </Button>
                    <span style={{ marginLeft: "0.5em" }}>{appointment.slotsAvailable} Spot{appointment.slotsAvailable > 1 ? "s" : ""} Left</span>
                  </Card.Content>
                </Card>
              </Card.Group>
            );
          })}
        </Fragment>
      )
    });
  }

  render() {
    const {
      loading,
      ageGroupOptions,
      ageGroups,
      sessionTypeOptions,
      sessionTypes,
      performerOptions,
      performers,
      spots,
      month,
      daysOfWeek,
      timesOfDay,
      timezone,
      chosenAppointment,
      chosenAppointmentLoading,
    } = this.state;

    if (chosenAppointment) {
      return (
        <Container>
          <Dimmer active={chosenAppointmentLoading} inverted>
            <Loader />
          </Dimmer>
          <Button
            icon='arrow left'
            labelPosition='left'
            fluid
            style={{ maxWidth: "900px", margin: "0 auto -22px" }}
            className="deferToInheritedFontFamily"
            content="Return to Availability"
            onClick={() => this.setState({ chosenAppointment: null })}
          />
          <Iframe
            url={chosenAppointment}
            width="100%"
            height="1000px"
            frameBorder="0"
            onLoad={() => this.setState({ chosenAppointmentLoading: false })}
          />
        </Container>
      );
    }

    const appointments = this.renderAppointments();

    return (
      <>
        <Dimmer active={loading} inverted>
          <Loader />
        </Dimmer>
        <Form>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Age Group</label>
              <Dropdown
                placeholder="All Ages"
                selection
                multiple
                options={ageGroupOptions}
                onChange={(event, data) => this.setState({ ageGroups: data.value })}
                value={ageGroups}
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
                search
                options={performerOptions}
                onChange={(event, data) => this.setState({ performers: data.value })}
                value={performers}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field className="deferToInheritedFontFamily">
              <label>Spots</label>
              <input
                type='number'
                value={spots}
                onChange={(event) => this.setState({ spots: (event.target.valueAsNumber || 1) })}
                min={1}
                inputmode={isTouch ? "numeric" : undefined}
              />
            </Form.Field>
            <Form.Field>
              <label>Day of Week</label>
              <Dropdown
                placeholder="All Days"
                selection
                multiple
                options={DAYS_OF_WEEK.map(option => ({
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
                options={TIMES_OF_DAY.map(option => ({
                  key: option,
                  text: option,
                  value: option,
                }))}
                onChange={(event, data) => this.setState({ timesOfDay: data.value })}
                value={timesOfDay}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field className="deferToInheritedFontFamily customDatePickerWidth">
              <label>Month</label>
              <DatePicker
                selected={month}
                onChange={date => this.setState({ month: date })}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                popperPlacement="bottom-center"
                withPortal={isTouch}
                customInput={<MonthPickerInput />}
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
          <Segment basic textAlign="center">
            <Button
              icon='delete'
              labelPosition='left'
              className="deferToInheritedFontFamily"
              content="Reset Filters"
              disabled={
                !ageGroups.length
                && !sessionTypes.length
                && month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear()
                && spots === 1
                && !daysOfWeek.length
                && !timesOfDay.length
                && !performers.length
              }
              onClick={() => this.setState({
                ageGroups: [],
                sessionTypes: [],
                month: new Date(),
                spots: 1,
                daysOfWeek: [],
                timesOfDay: [],
                performers: [],
              })}
            />
          </Segment>
        </Form>
        {!loading && appointments}
        {!loading && (!appointments.length || appointments.every(appointmentDay => !appointmentDay)) && (
          <Segment basic textAlign="center" content="No available appointments match your selections." />
        )}
      </>
    );
  }
}

export default withRouter(App);
