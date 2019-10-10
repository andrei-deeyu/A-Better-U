import React, { Component } from 'react';
import SortBtns from './AddFoodSortButtons.jsx';
import { AddFoodContext } from '../../../AppContext/ExportContexts';

//might remove this component and put it into AddFoodView

class AddFoodHeader extends Component {
  render() {
    const currentMeal = this.props.match.params.meal;
    return (
      <AddFoodContext.Consumer>
        { ({onEnter}) => (
          <div id="AddFoodHeader">
            <h1>Add {currentMeal}</h1>
            <textarea id="AddFoodSearch"
              onClick={(e) => e.target.value = ""}
              onKeyPress={(e) => onEnter(e)}
              placeholder="Search for a food item">
            </textarea>
            <SortBtns />
          </div>
        )}
      </AddFoodContext.Consumer>
    );
  }

}

export default AddFoodHeader;
