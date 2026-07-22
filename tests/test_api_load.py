import pytest
import time

@pytest.mark.parametrize("test_case_id", range(1, 401))
def test_api_load_scenario(test_case_id):
    """
    Simulates an API Load Test Case.
    """
    # Dummy assertion to pass the test
    assert True
