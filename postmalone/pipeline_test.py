import unittest

from .pipeline import Processor, run_processors


class PlusTwo(Processor):

    def process(self, data):
        return data + 2


class MinusOne(Processor):
 
    def process(self, data):
        return data - 1


class TestPipeline(unittest.TestCase):

    def test_run_processors(self):
        processors = [PlusTwo(), MinusOne()]
        self.assertEqual(3, run_processors(processors, 2))
